pragma solidity ^0.5.0;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "./RBBLib.sol";

contract RBBRegistry is Ownable() {

    /** Account States:
        AVAILABLE - The account is not yet assigned any role.
        WAITING_VALIDATION - The account was linked to a legal entity but it still needs to be validated
        VALIDATED - The account was validated
        INVALIDATED - The account was invalidated
        PAUSED - The account was paused and can be reactived anytime (it returns to VALIDATED)
     */
    enum BlockchainAccountState {AVAILABLE,WAITING_VALIDATION,VALIDATED,INVALIDATED,PAUSED}
    BlockchainAccountState blockchainState; /* Variable not used, only defined to create the enum type. */

    enum BlockchainAccountRole {NORMAL, ADMIN, SYSTEM}
    BlockchainAccountRole blockchainRole;  /* Variable not used, only defined to create the enum type. */

     /**
        This represents a real life organization
     */
    struct LegalEntityInfo {
        uint id; //Brazilian identification of legal entity
        string idProofHash; //hash of declaration
        BlockchainAccountState state;
        BlockchainAccountRole role;
    }

    /**
        Links Ethereum addresses to LegalEntityInfo
     */
    mapping(address => LegalEntityInfo) public legalEntitiesInfo;

    /**
        Links Legal Entity IDs to Ethereum addresses.
     */
    mapping(uint => address[]) legalEntityId_To_Addr;

    event AccountRegistration(address addr, uint id,  string idProofHash);
    event AccountValidation(address addr, uint id, address responsible);
    event AccountInvalidation(address addr, uint id, address responsible);
    event AccountAdminUpgrade(address addr, uint id, address responsible);
    event AccountPaused(address addr, uint id, address responsible);
    event AccountUnpaused(address addr, uint id, address responsible);

    constructor (uint idResposibleForValidation) public {        
        legalEntitiesInfo[msg.sender] = LegalEntityInfo(idResposibleForValidation, "", BlockchainAccountState.VALIDATED, BlockchainAccountRole.SYSTEM);
        legalEntityId_To_Addr[idResposibleForValidation].push(msg.sender);
        emit AccountRegistration(msg.sender, idResposibleForValidation, "");
    }

   /**
    * Link blockchain address with ID
    * @param id Brazilian identifier to legal entities
    * @param idProofHash The legal entities have to send BNDES a PDF where it assumes as responsible for an Ethereum account.
    *                   This PDF is signed with eCNPJ and send to BNDES.
    */
    function registryLegalEntity(uint id, string memory idProofHash) public {
        
        address addr = msg.sender;

        require (isAvailableAccount(addr), "Endereço não pode ter sido cadastrado anteriormente");

        if ( RBBLib.isValidHash(idProofHash) ) { 
            legalEntitiesInfo[addr] = LegalEntityInfo(id, idProofHash, 
                                                       BlockchainAccountState.WAITING_VALIDATION, 
                                                       BlockchainAccountRole.ADMIN );
        } else {
            legalEntitiesInfo[addr] = LegalEntityInfo(id, idProofHash, 
                                                       BlockchainAccountState.WAITING_VALIDATION, 
                                                       BlockchainAccountRole.NORMAL );
        }

        legalEntityId_To_Addr[id].push(addr);

        emit AccountRegistration(addr, id, idProofHash);
    }

    modifier onlyUnpausedAccount() {
        if ( legalEntitiesInfo[msg.sender].state != BlockchainAccountState.PAUSED )
        _;
    }

   /**
    * Validates the initial registry of a legal entity 
    * @param addr Ethereum address that needs to be validated
    */
    function validateRegistryLegalEntity(address addr) public onlyUnpausedAccount {

        address responsible = msg.sender;

        require(isResponsibleForRegistryValidation(responsible), "Somente responsável pela validação pode validar contas");

        require(legalEntitiesInfo[addr].state == BlockchainAccountState.WAITING_VALIDATION,
            "A conta precisa estar no estado Aguardando Validação");

        legalEntitiesInfo[addr].state = BlockchainAccountState.VALIDATED;

        emit AccountValidation(addr, legalEntitiesInfo[addr].id, responsible);
    }

/**
    * Pause an account     
    * @param addr Ethereum address that needs to be validated
    */
    function pauseRegistryLegalEntity(address addr) public onlyUnpausedAccount {

        address responsible = msg.sender;

        require( isValidatedAccount(responsible) , "Somente uma conta responsável válida pode pausar outras contas");
        require( isValidatedAccount(addr) , "Somente uma conta válida pode ser pausada");

        legalEntitiesInfo[addr].state = BlockchainAccountState.PAUSED;
        
        emit AccountPaused(addr, legalEntitiesInfo[addr].id, responsible);
    }


/**
    * Unpause an account     
    * @param addr Ethereum address that needs to be validated
    */
    function unpauseRegistryLegalEntity(address addr) public onlyUnpausedAccount {

        address responsible = msg.sender;

        require( isResponsibleForRegistryValidation(responsible) , "Somente uma conta responsável validadora pode despausar outras contas" );        
        require( ( legalEntitiesInfo[addr].state == BlockchainAccountState.PAUSED ) , "Somente uma conta pausada pode ser despausada" ); 

        legalEntitiesInfo[addr].state = BlockchainAccountState.VALIDATED;
        
        emit AccountUnpaused(addr, legalEntitiesInfo[addr].id, responsible);
    }


   /**
    * Invalidates the initial registry of a legal entity or the change of its registry
    * The invalidation can be called at any time in the lifecycle of the address (not only when it is WAITING_VALIDATION)
    * @param addr Ethereum address that needs to be validated
    */
    function invalidateRegistryLegalEntity(address addr) public onlyUnpausedAccount {

        address responsible = msg.sender;

        require(isResponsibleForRegistryValidation(responsible), "Somente responsável pela validação pode invalidar contas");

        legalEntitiesInfo[addr].state = BlockchainAccountState.INVALIDATED;
        
        emit AccountInvalidation(addr, legalEntitiesInfo[addr].id, responsible);
    }


   /**
    * By default, the owner is also the Responsible for Validation.
    * The owner can assign other address to be the Responsible for Validation.
    * @param addr Ethereum address to be assigned as Responsible for Validation.
    */
    function setResponsibleForRegistryValidation(address addr) public {
        require ( ( legalEntitiesInfo[addr].role == BlockchainAccountRole.ADMIN || 
                 legalEntitiesInfo[addr].role == BlockchainAccountRole.SYSTEM || isOwner(addr) ), "Apenas Owner, Admin ou System podem dar poder de Admin");
        legalEntitiesInfo[addr].role = BlockchainAccountRole.ADMIN;        
        emit AccountAdminUpgrade(addr, legalEntitiesInfo[addr].id, msg.sender);
    }

    function isResponsibleForRegistryValidation(address addr) public view returns (bool) {
        return ( legalEntitiesInfo[addr].role == BlockchainAccountRole.ADMIN || 
                 legalEntitiesInfo[addr].role == BlockchainAccountRole.SYSTEM   );
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

    function getId (address addr) public view returns (uint) {
        return legalEntitiesInfo[addr].id;
    }

    function getLegalEntityInfo (address addr) public view returns (uint, string memory, uint, uint, address) {
        return (  legalEntitiesInfo[addr].id, 
                  legalEntitiesInfo[addr].idProofHash, 
                  (uint) (legalEntitiesInfo[addr].state),
                  (uint) (legalEntitiesInfo[addr].role),
                  addr 
               );
    }

    function getBlockchainAccounts(uint id) public view returns (address[] memory) {
        return legalEntityId_To_Addr[id];
    }

    function getAccountState(address addr) public view returns (int) {
        return ((int) (legalEntitiesInfo[addr].state));
    }

    function registryMock(uint id)
        public {
        
        address addr = msg.sender;
        string memory idProofHash = "";

        legalEntitiesInfo[addr] = LegalEntityInfo(id, idProofHash, BlockchainAccountState.VALIDATED, BlockchainAccountRole.ADMIN );

        legalEntityId_To_Addr[id].push(addr);

        emit AccountRegistration(addr, id, idProofHash);
    }


}