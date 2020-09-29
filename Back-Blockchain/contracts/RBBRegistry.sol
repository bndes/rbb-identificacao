pragma solidity ^0.5.0;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "./RBBLib.sol";

contract RBBRegistry is Ownable() {

    /** Account States:
        AVAILABLE - The account is not yet assigned any role.
        WAITING_VALIDATION - The account was linked to a legal entity but it still needs to be validated
        VALIDATED - The account was validated
        INVALIDATED - The account was invalidated
     */
    enum BlockchainAccountState {AVAILABLE,WAITING_VALIDATION,VALIDATED,INVALIDATED}
    BlockchainAccountState blockchainState; /* Variable not used, only defined to create the enum type. */

    enum BlockchainAccountRole {NORMAL, ADMIN, SYSADMIN} 
    BlockchainAccountRole blockchainRole;  /* Variable not used, only defined to create the enum type. */

    /* This is a helper variable to emulate a sequence and autoincrement Ids*/
    uint public currentRBBId = 0;

     /**
        This represents a real life organization
     */
    struct LegalEntityInfo {
        uint RBBId; //Unique ID for RBB 
        uint BRId; //Brazilian identification of legal entity
        bytes32 idProofHash; //hash of declaration
        BlockchainAccountState state;
        BlockchainAccountRole role;
        bool paused;
        uint256 dateTimeCertificateExpiration; 
    }

    /**
        Links Ethereum addresses to LegalEntityInfo
     */
    mapping(address => LegalEntityInfo) public legalEntitiesInfo;

    /**
        Links Legal Entity IDs to Ethereum addresses.
     */
    mapping(uint => address[]) legalEntityId_To_Addr;

    event AccountRegistration(address addr, uint RBBId, uint BRId,  bytes32 idProofHash, uint256 dateTimeCertificateExpiration);
    event AccountValidation(address addr, uint RBBId,  uint BRId, address responsible);
    event AccountInvalidation(address addr, uint RBBId,  uint BRId, address responsible);
    event AccountAdminUpgrade(address addr, uint RBBId,  uint BRId, address responsible);
    event AccountPaused(address addr, uint RBBId,  uint BRId, address responsible);
    event AccountUnpaused(address addr, uint RBBId,  uint BRId, address responsible);

    /* The responsible for the System-Admin is the Owner. It could be or not be the same address (sysadmin=owner) */
    constructor (uint BRIdSysAdmin, string memory proofHashSysAdmin, uint256 dateTimeCertificateExpiration) public {                
        address addrSysAdmin = msg.sender;
        bytes32 proofHash = RBBLib.stringBytes32(proofHashSysAdmin);
        uint RBBId = getNextRBBId();
        legalEntitiesInfo[addrSysAdmin] = LegalEntityInfo(  RBBId, 
                                                            BRIdSysAdmin, 
                                                            proofHash, 
                                                            BlockchainAccountState.VALIDATED, 
                                                            BlockchainAccountRole.SYSADMIN, 
                                                            false, 
                                                            dateTimeCertificateExpiration     );
        legalEntityId_To_Addr[BRIdSysAdmin].push(addrSysAdmin);
        emit AccountRegistration(addrSysAdmin, RBBId, BRIdSysAdmin, proofHash, dateTimeCertificateExpiration); 
        
    }

   /**
    * Link blockchain address with BRId
    * @param BRId Brazilian identifier to legal entities
    * @param BRIdProofHash The legal entities have to send BNDES a PDF where it assumes as responsible for an Ethereum account.
    *                   This PDF is signed with eCNPJ and send to BNDES.
    */
    function registryLegalEntity(uint BRId, string memory BRIdProofHash, uint256 dateTimeCertificateExpiration) public {
        
        address addr = msg.sender;
        bytes32 proofHash = RBBLib.stringBytes32(BRIdProofHash);
        uint RBBId = getNextRBBId();

        require (isAvailableAccount(addr), "Endereço não pode ter sido cadastrado anteriormente");

        if ( proofHash == 0 ) { 
            legalEntitiesInfo[addr] = LegalEntityInfo(  RBBId,
                                                        BRId, 
                                                        proofHash, 
                                                        BlockchainAccountState.WAITING_VALIDATION, 
                                                        BlockchainAccountRole.ADMIN,
                                                        false,
                                                        dateTimeCertificateExpiration );
        } else {
            legalEntitiesInfo[addr] = LegalEntityInfo(  RBBId,
                                                        BRId, 
                                                        proofHash, 
                                                        BlockchainAccountState.WAITING_VALIDATION, 
                                                        BlockchainAccountRole.NORMAL,
                                                        false,
                                                        dateTimeCertificateExpiration );
        }

        legalEntityId_To_Addr[BRId].push(addr);

        emit AccountRegistration(addr, RBBId, BRId, proofHash, dateTimeCertificateExpiration);
    }

    modifier onlyWhenNotPaused() { 
        require( ! legalEntitiesInfo[msg.sender].paused , "Apenas quem não está pausada pode acessar" );
        _;
    }

    modifier onlyWhenNotExpired() { 
        require( legalEntitiesInfo[msg.sender].dateTimeCertificateExpiration > now , "Apenas contas com declarações cujos certificados ainda são válidos." );
        _;
    }

   /**
    * Validates the initial registry of a legal entity 
    * @param userAddr Ethereum address that needs to be validated
    */
    function validateRegistryLegalEntity(address userAddr) public onlyWhenNotPaused onlyWhenNotExpired {

        address responsible = msg.sender;

        require(isResponsibleForRegistryValidation(responsible), "Somente responsável pela validação pode validar contas");
        
        require ( legalEntitiesInfo[responsible].role == BlockchainAccountRole.SYSADMIN 
                || 
                ( legalEntitiesInfo[responsible].role == BlockchainAccountRole.ADMIN
                     && isTheSameID(responsible, userAddr) )
            , "O responsável pela validação deve ser da mesma organização (mesmo CNPJ)" );

        require(legalEntitiesInfo[userAddr].state == BlockchainAccountState.WAITING_VALIDATION,
            "A conta precisa estar no estado Aguardando Validação");

        legalEntitiesInfo[userAddr].state = BlockchainAccountState.VALIDATED;

        emit AccountValidation( userAddr, 
                                legalEntitiesInfo[userAddr].RBBId, 
                                legalEntitiesInfo[userAddr].BRId, 
                                responsible);
    }

/**
    * Pause an account     
    * @param addr Ethereum address that needs to be paused
    */
    function pauseAddress(address addr) public onlyWhenNotPaused {

        address responsible = msg.sender;

        require ( legalEntitiesInfo[addr].role != BlockchainAccountRole.SYSADMIN , "A conta SYSADMIN não pode ser pausada");
        require( isTheSameID(responsible, addr) || legalEntitiesInfo[responsible].role == BlockchainAccountRole.SYSADMIN, "Somente pode pausar uma conta quem for da mesma organização ou System Administrator" );
        require( isValidatedAccount(addr) , "Somente uma conta válida pode ser pausada");

        legalEntitiesInfo[addr].paused = true;
        
        emit AccountPaused( addr, 
                            legalEntitiesInfo[addr].RBBId,
                            legalEntitiesInfo[addr].BRId, 
                            responsible);
    }

    function pauseLegalEntity(uint BRId) public onlyWhenNotPaused {

        address responsible = msg.sender;
        address[] memory addresses  = legalEntityId_To_Addr[BRId];

        require( isTheSameID(responsible, addresses[0]) || legalEntitiesInfo[responsible].role == BlockchainAccountRole.SYSADMIN, "Somente pode pausar uma conta quem for da mesma organização ou System Administrator" );

        for (uint i=0; i < addresses.length ; i++) {
            address candidate = addresses[i];
            if( isValidatedAccount( candidate ) ) {
                legalEntitiesInfo[candidate].paused = true;
                emit AccountPaused( candidate, 
                                    legalEntitiesInfo[candidate].RBBId,
                                    legalEntitiesInfo[candidate].BRId, 
                                    responsible );
            }
        }   
    }

/**
    * Unpause an account     
    * @param addr Ethereum address that needs to be validated
    */
    function unpauseAddress(address addr) public onlyWhenNotPaused onlyWhenNotExpired {

        address responsible = msg.sender;

        require ( responsible != addr , "Uma pessoa não é capaz de retirar o pause de sua própria conta");
        require( isResponsibleForRegistryValidation(responsible) , "Somente uma conta responsável validadora pode despausar outras contas" );        
        require( legalEntitiesInfo[addr].paused  , "Somente uma conta pausada pode ser despausada" ); 

        legalEntitiesInfo[addr].paused = false;
        
        emit AccountUnpaused(   addr, 
                                legalEntitiesInfo[addr].RBBId,
                                legalEntitiesInfo[addr].BRId, 
                                responsible);
    }


   /**
    * Invalidates the initial registry of a legal entity or the change of its registry
    * The invalidation can be called at any time in the lifecycle of the address (not only when it is WAITING_VALIDATION)
    * @param addr Ethereum address that needs to be validated
    */
    function invalidateRegistryLegalEntity(address addr) public onlyWhenNotPaused onlyWhenNotExpired {

        address responsible = msg.sender;

        require(isResponsibleForRegistryValidation(responsible), "Somente responsável pela validação pode invalidar contas");
        require ( legalEntitiesInfo[addr].role != BlockchainAccountRole.SYSADMIN , "A conta SYSADMIN não pode ser invalidada");
        require ( legalEntitiesInfo[addr].state != BlockchainAccountState.INVALIDATED, "A conta foi invalidada previamente." );

        legalEntitiesInfo[addr].state = BlockchainAccountState.INVALIDATED;
        
        emit AccountInvalidation(   addr, 
                                    legalEntitiesInfo[addr].RBBId, 
                                    legalEntitiesInfo[addr].BRId, 
                                    responsible );
    }


   /**
    * By default, the owner is also the Responsible for Validation.
    * The owner can assign other address to be the Responsible for Validation.
    * @param addr Ethereum address to be assigned as Responsible for Validation.
    */
    function setResponsibleForRegistryValidation(address addr) public {
        require ( ( legalEntitiesInfo[addr].role == BlockchainAccountRole.ADMIN || 
                 legalEntitiesInfo[addr].role == BlockchainAccountRole.SYSADMIN || isOwner(addr) ), "Apenas Owner, Admin ou System-Admin podem dar poder de Admin");
        legalEntitiesInfo[addr].role = BlockchainAccountRole.ADMIN;        
        emit AccountAdminUpgrade(   addr, 
                                    legalEntitiesInfo[addr].RBBId, 
                                    legalEntitiesInfo[addr].BRId, 
                                    msg.sender );
    }

    function isResponsibleForRegistryValidation(address addr) public view returns (bool) {
        return ( legalEntitiesInfo[addr].role == BlockchainAccountRole.ADMIN || 
                 legalEntitiesInfo[addr].role == BlockchainAccountRole.SYSADMIN   );
    }

    function isOwner(address addr) public view returns (bool) {
        return owner()==addr;
    }

    function isAvailableAccount(address addr) public view returns (bool) {
        return legalEntitiesInfo[addr].state == BlockchainAccountState.AVAILABLE;
    }

    function isWaitingValidationAccount(address addr) public view returns (bool) {
        return legalEntitiesInfo[addr].state == BlockchainAccountState.WAITING_VALIDATION;
    }

    function isValidatedAccount(address addr) public view returns (bool) {
        return legalEntitiesInfo[addr].state == BlockchainAccountState.VALIDATED;
    }

    function isInvalidated(address addr) public view returns (bool) {
        return legalEntitiesInfo[addr].state == BlockchainAccountState.INVALIDATED;
    }

    function isTheSameID(address a, address b) public view returns (bool) {
        return legalEntitiesInfo[a].BRId == legalEntitiesInfo[b].BRId ;
    }

    function getId (address addr) public view returns (uint) {
        return getRBBId(addr);
    }

    function getRBBId (address addr) public view returns (uint) {
        return legalEntitiesInfo[addr].RBBId;
    }

    function getBRId (address addr) public view returns (uint) {
        return legalEntitiesInfo[addr].BRId;
    }    

    function getLegalEntityInfo (address addr) public view returns (uint, uint, string memory, uint, uint, bool, uint256) {
        LegalEntityInfo memory reg = legalEntitiesInfo[addr];
        string memory strProofHash = RBBLib.bytes32ToStr(reg.idProofHash);

        return (  reg.RBBId,
                  reg.BRId, 
                  strProofHash, 
                  (uint) (reg.state),
                  (uint) (reg.role),
                  reg.paused,
                  reg.dateTimeCertificateExpiration
                );
    }

    function getBlockchainAccounts(uint BRId) public view returns (address[] memory) {
        return legalEntityId_To_Addr[BRId];
    }

    function getAccountState(address addr) public view returns (int) {
        return ((int) (legalEntitiesInfo[addr].state));
    }

    function getAccountRole(address addr) public view returns (int) {
        return ((int) (legalEntitiesInfo[addr].role));
    }

    function registryMock(uint BRId) public {
        
        address addr = msg.sender;
        bytes32 proofHash = 0;
        uint256 dateTimeCertificateExpiration = 4294967296; //2106 = 2^32 (Max 2^256 -1)
        uint RBBId = getNextRBBId();
        legalEntitiesInfo[addr] = LegalEntityInfo(  RBBId, 
                                                    BRId, 
                                                    proofHash, 
                                                    BlockchainAccountState.VALIDATED, 
                                                    BlockchainAccountRole.ADMIN, 
                                                    false, 
                                                    dateTimeCertificateExpiration );

        legalEntityId_To_Addr[BRId].push(addr);

        emit AccountRegistration(addr, RBBId, BRId, proofHash, dateTimeCertificateExpiration);
    }

    function getNextRBBId() private returns (uint) {
        return ++currentRBBId;
    }   
 

}