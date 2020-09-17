pragma solidity ^0.5.0;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "./RBBLib.sol";

//TODO: Pensar numa nova chave ao inves do CNPJ, seria o RBBID 

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

    enum BlockchainAccountRole {NORMAL, ADMIN, SYSADMIN} 
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
//TODO: pensar sobre o vencimento do ECNPJ e se deveria vencer o RBBID associado.
//PROPOSTA: O Back poderia ler a data de expiracao do certificado e confirmar a duracao da validade na blockchain.
    event AccountRegistration(address addr, uint id,  string idProofHash);
    event AccountValidation(address addr, uint id, address responsible);
    event AccountInvalidation(address addr, uint id, address responsible);
    event AccountAdminUpgrade(address addr, uint id, address responsible);
    event AccountPaused(address addr, uint id, address responsible);
    event AccountUnpaused(address addr, uint id, address responsible);

//todo: pensar vale a pena ter auto-declaracao do bndes e colocar o hash aqui no construtor
//PROPOSTA: acho legal o BNDES ter a auto-declaracao de propriedade e responsabilidade pelas transacoes do endereco e preencher o hash
    /* The responsible for the System-Admin is the Owner. It could be or not be the same address (sysadmin=owner) */
    constructor (uint idSysAdmin, string memory proofHashSysAdmin) public {        
        address addrSysAdmin = msg.sender;
        legalEntitiesInfo[addrSysAdmin] = LegalEntityInfo(idSysAdmin, proofHashSysAdmin, BlockchainAccountState.VALIDATED, BlockchainAccountRole.SYSADMIN);
        legalEntityId_To_Addr[idSysAdmin].push(addrSysAdmin);
        emit AccountRegistration(addrSysAdmin, idSysAdmin, proofHashSysAdmin); 
        
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

    modifier onlyValidatedAccount() { 
        require( legalEntitiesInfo[msg.sender].state == BlockchainAccountState.VALIDATED, "Apenas conta validada pode acessar a função" );
        _;
    }

   /**
    * Validates the initial registry of a legal entity 
    * @param userAddr Ethereum address that needs to be validated
    */
    function validateRegistryLegalEntity(address userAddr) public onlyValidatedAccount {

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

        emit AccountValidation(userAddr, legalEntitiesInfo[userAddr].id, responsible);
    }

/**
    * Pause an account     
    * @param addr Ethereum address that needs to be paused
    */
    function pauseRegistryLegalEntity(address addr) public onlyValidatedAccount {

        address responsible = msg.sender;

        require ( legalEntitiesInfo[addr].role != BlockchainAccountRole.SYSADMIN , "A conta SYSADMIN não pode ser pausada");
        require( isTheSameID(responsible, addr) || legalEntitiesInfo[reponsible].role == BlockchainAccountRole.SYSADMIN, "Somente pode pausar uma conta quem for da mesma organização ou System Administrator" );
        require( isValidatedAccount(addr) , "Somente uma conta válida pode ser pausada");
        //TODO: deveria pausar em qualquer estado??
        //PROPOSTA: pausar apenas contas validas/ativas, porque o unpause nao precisa guardar o estado anterior.

        legalEntitiesInfo[addr].state = BlockchainAccountState.PAUSED;
        
        emit AccountPaused(addr, legalEntitiesInfo[addr].id, responsible);
    }

    function pauseLegalEntity(uint id) public onlyValidatedAccount {

        address responsible = msg.sender;
        address[] memory addresses  = legalEntityId_To_Addr[id];

        require( isTheSameID(responsible, addresses[0]) || legalEntitiesInfo[reponsible].role == BlockchainAccountRole.SYSADMIN, "Somente pode pausar uma conta quem for da mesma organização ou System Administrator" );

        for (uint i=0; i < addresses.length ; i++) {
            address candidate = addresses[i];
            if( isValidatedAccount( candidate ) ) {
                legalEntitiesInfo[ candidate ].state = BlockchainAccountState.PAUSED;
                emit AccountPaused( candidate, legalEntitiesInfo[candidate].id, responsible );
            }
        }   
    }

/**
    * Unpause an account     
    * @param addr Ethereum address that needs to be validated
    */
    function unpauseRegistryLegalEntity(address addr) public onlyValidatedAccount {

        address responsible = msg.sender;

        require ( responsible != addr , "Uma pessoa não é capaz de retirar o pause de sua própria conta");
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
    function invalidateRegistryLegalEntity(address addr) public onlyValidatedAccount {

        address responsible = msg.sender;

        require(isResponsibleForRegistryValidation(responsible), "Somente responsável pela validação pode invalidar contas");
        require ( legalEntitiesInfo[addr].role != BlockchainAccountRole.SYSADMIN , "A conta SYSADMIN não pode ser invalidada");
        require ( legalEntitiesInfo[addr].state != BlockchainAccountState.INVALIDATED, "A conta foi invalidada previamente." );

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
                 legalEntitiesInfo[addr].role == BlockchainAccountRole.SYSADMIN || isOwner(addr) ), "Apenas Owner, Admin ou System-Admin podem dar poder de Admin");
        legalEntitiesInfo[addr].role = BlockchainAccountRole.ADMIN;        
        emit AccountAdminUpgrade(addr, legalEntitiesInfo[addr].id, msg.sender);
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
        return legalEntitiesInfo[a].id == legalEntitiesInfo[b].id ;
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

    function getAccountRole(address addr) public view returns (int) {
        return ((int) (legalEntitiesInfo[addr].role));
    }

    function registryMock(uint id) public {
        
        address addr = msg.sender;
        string memory idProofHash = "";

        legalEntitiesInfo[addr] = LegalEntityInfo(id, idProofHash, BlockchainAccountState.VALIDATED, BlockchainAccountRole.ADMIN );

        legalEntityId_To_Addr[id].push(addr);

        emit AccountRegistration(addr, id, idProofHash);
    }


}