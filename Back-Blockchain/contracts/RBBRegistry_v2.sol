pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IRBBRegistry_v2.sol";

contract RBBRegistry_v2 is IRBBRegistry_v2, Ownable() {

    enum BlockchainAccountState {AVAILABLE,WAITING_VALIDATION,WAITING_APPROVAL,WAITING_REJECTION,VALIDATED,INVALIDATED}
    BlockchainAccountState blockchainState; /* Variable not used, only defined to create the enum type. */
      
    /**
    REGULAR  - operates 
    ADMIN    - validates the regular.
     */
    enum BlockchainAccountRole {REGULAR, ADMIN} 
    BlockchainAccountRole blockchainRole;  /* Variable not used, only defined to create the enum type. */

    //Ativação/inativação de Registries no processo usual (pode ser via um processo automatizado) 
    address public responsibleForRegistryPreValidation;
    address public responsibleForRegistryValidation;

    //Inativação e pause/unpause decorrente de eventos não previstos (por exemplo, um comportamento inadequado de um Registry) 
    address public responsibleForActingAfterMonitoring;

    /* This is a helper variable to emulate a sequence and autoincrement Ids*/
    uint public currentRBBId = 0;

     /**
        This registry is about a company representative information
     */    
    struct Registry {
        uint RBBId; //uma proxy para o CNPJ
        uint64 CNPJ; //Brazilian identification of legal entity
        string hashProof; //hash of declaration
        BlockchainAccountState state;
        BlockchainAccountRole role;
        bool paused;
        uint256 dateTimeExpiration; //vai ser outro momento de expiração diferente do ECNPJ
    }

    uint256 public defaultDeltaDateTimeExpiration = 365 days; 

    /**
        Links Ethereum addresses to Registry
     */
    mapping(address => Registry) public legalEntitiesInfo;

    /**
        Links RBBID to Ethereum addresses.
     */
    mapping(uint => address[]) public RBBId_addresses;
    
    /**
     * Links CNPJ to its RBBID
     */
    mapping (uint64 => uint) public CNPJ_RBBId;

    //responsible is the msg.sender
    event AccountRegistration       (address addr, uint RBBId, uint64 CNPJ, string hashProof, uint256 dateTimeExpiration);
    event AccountWaitingApproval    (address addr, uint RBBId, uint64 CNPJ, address responsible);
    event AccountWaitingRejection   (address addr, uint RBBId, uint64 CNPJ, address responsible);
    event AccountValidation         (address addr, uint RBBId, uint64 CNPJ, address responsible);
    event AccountInvalidation       (address addr, uint RBBId, uint64 CNPJ, address responsible, uint8 reason);
    event AccountPaused             (address addr, uint RBBId, uint64 CNPJ, address responsible, uint8 reason);
    event AccountUnpaused           (address addr, uint RBBId, uint64 CNPJ, address responsible, uint8 reason);
    event AccountRoleChange         (address addr, uint RBBId, uint64 CNPJ, address responsible, BlockchainAccountRole roleBefore, BlockchainAccountRole roleNew);
    event AccountReactivation       (address addr, string hashProof, uint256 dateTimeExpiration);

    event RegistryExpirationChange  (address addr, uint256 dateTimeExpirationBefore, uint256 dateTimeExpirationNew);

    event RoleDefinitionRegistryPreValidation(address rs);
    event RoleDefinitionRegistryValidation(address rs);
    event RoleDefinitionActingAfterMonitoring(address rs);


    constructor () public {                
        responsibleForRegistryPreValidation = msg.sender;
        responsibleForRegistryValidation = msg.sender;
        responsibleForActingAfterMonitoring = msg.sender;         
    }

    function setResponsibleForRegistryPreValidation(address rs) onlyOwner public {
        responsibleForRegistryPreValidation = rs;
        emit RoleDefinitionRegistryPreValidation(rs);
    }    
    function setResponsibleForRegistryValidation(address rs) onlyOwner public {
        responsibleForRegistryValidation = rs;
        emit RoleDefinitionRegistryValidation(rs);
    }    
    function setResponsibleForActingAfterMonitoring(address rs) onlyOwner public {
        responsibleForActingAfterMonitoring = rs;
        emit RoleDefinitionActingAfterMonitoring(rs);
    }  
    
    modifier onlyByResponsibleForRegistryPreValidation() { 
        require( responsibleForRegistryPreValidation==msg.sender , "A ação só pode ser executada pela conta responsável pela pré-validação" );
        _;
    }

    modifier onlyByResponsibleForRegistryValidation() { 
        require( responsibleForRegistryValidation==msg.sender , "A ação só pode ser executada pela conta responsável pela validação" );
        _;
    }

    modifier onlyByResponsibleForActingAfterMonitoring() { 
        require( responsibleForActingAfterMonitoring==msg.sender , "A ação só pode ser executada pela conta responsável pela tomar ações decorrentes de monitoração" );
        _;
    }

    modifier onlyIfSenderIsOperational() { 
        require( ! isPaused(msg.sender), "Apenas contas não pausadas podem executar esta operação" );
        require( ! isExpired(msg.sender), "Apenas contas com declarações cujos certificados ainda são válidos podem executar esta operação" );
        require( isValidatedAccount(msg.sender), "Apenas contas validadas podem executar esta operação" );
        _;
    }
    
    function registryLegalEntityForRegularAccounts(uint64 cnpj) public {
        registryLegalEntity(cnpj, "0");
    }
    
   /**
    * Self Registering
    * Link blockchain address with CNPJ
    * @param CNPJ Brazilian identifier to legal entities
    * @param proofHash The legal entities have to send BNDES a PDF where it assumes as responsible for an Ethereum account.
    *                   This PDF is signed with eCNPJ and send to BNDES.
    */
    function registryLegalEntity(uint64 CNPJ, string memory proofHash) public {
        
        address addr = msg.sender;

        require (isAvailableAccount(addr), "Endereço não pode ter sido cadastrado anteriormente");

        uint256 dateTimeExpiration = now + defaultDeltaDateTimeExpiration;
        uint RBBId = calculaProximoRBBID(CNPJ);


        if ( isZeroHash(proofHash) ) { 
            legalEntitiesInfo[addr] = Registry( RBBId,
                                                CNPJ, 
                                                proofHash, 
                                                BlockchainAccountState.WAITING_VALIDATION, 
                                                BlockchainAccountRole.REGULAR,
                                                false,
                                                dateTimeExpiration );
        } else {
    
            require (isValidHash(proofHash), "O hash da declaração é inválido");

            legalEntitiesInfo[addr] = Registry( RBBId,
                                                CNPJ, 
                                                proofHash, 
                                                BlockchainAccountState.WAITING_VALIDATION, 
                                                BlockchainAccountRole.ADMIN,
                                                false,
                                                dateTimeExpiration );
        }

        RBBId_addresses[RBBId].push(addr);
        string memory proof = proofHash;
        emit AccountRegistration(addr, RBBId, CNPJ, proof, dateTimeExpiration);
    }

    /**
    * Validates the initial registry of others LegalEntities
    * @param userAddr Ethereum address that needs to be validated
    */
    function preValidateRegistry(address userAddr, bool approval) public onlyByResponsibleForRegistryPreValidation {

        address responsible = msg.sender;
        
        require( legalEntitiesInfo[userAddr].state == BlockchainAccountState.WAITING_VALIDATION, 
                "A conta precisa estar em estado Aguardando Validação");

        require ( isAdmin(userAddr), "A conta a validar deve ter o papel de ADMIN" );

        require (!isPaused(userAddr), "A conta não pode ser validada porque está pausada"); 

        require (!isExpired(userAddr), "A conta não pode ser validada porque está expirada");

        if ( approval ) {
            legalEntitiesInfo[userAddr].state = BlockchainAccountState.WAITING_APPROVAL;
            emit AccountWaitingApproval(    userAddr, 
                                            legalEntitiesInfo[userAddr].RBBId, 
                                            legalEntitiesInfo[userAddr].CNPJ, 
                                            responsible );
        }
        else {
            legalEntitiesInfo[userAddr].state = BlockchainAccountState.WAITING_REJECTION;
            emit AccountWaitingRejection(   userAddr, 
                                            legalEntitiesInfo[userAddr].RBBId, 
                                            legalEntitiesInfo[userAddr].CNPJ, 
                                            responsible );
        }
    }
    

   /**
    * Validates the initial registry of your own LegalEntity
    * @param userAddr Ethereum address that needs to be validated
    */
    function validateRegistrySameOrg(address userAddr) public onlyIfSenderIsOperational {

        address responsible = msg.sender;

        require ( isAdmin(responsible), "O responsável pela validação deve ter o papel ADMIN" );

        require( legalEntitiesInfo[userAddr].state == BlockchainAccountState.WAITING_VALIDATION, 
                "A conta precisa estar em estado Aguardando Validação");

        require (!isPaused(userAddr), "A conta não pode ser validada porque está pausada"); 

        require (!isExpired(userAddr), "A conta não pode ser validada porque está expirada");

        require ( legalEntitiesInfo[userAddr].role == BlockchainAccountRole.REGULAR, 
                   "O usuário a ser validado deve ter o papel REGULAR" );

        require ( isTheSameID(responsible, userAddr) , 
                   "O responsável pela validação deve ser da mesma organização (mesmo CNPJ)" );                   

        legalEntitiesInfo[userAddr].state = BlockchainAccountState.VALIDATED;

        emit AccountValidation( userAddr, 
                                legalEntitiesInfo[userAddr].RBBId, 
                                legalEntitiesInfo[userAddr].CNPJ, 
                                responsible);
    }

    /**
    * Validates the initial registry of others LegalEntities
    * @param userAddr Ethereum address that needs to be validated
    */
    function validateRegistry(address userAddr) public onlyByResponsibleForRegistryValidation {

        address responsible = msg.sender;

        require( isWaitingAccount(userAddr), "A conta precisa estar em estado Aguardando");

        require (!isPaused(userAddr), "A conta não pode ser validada porque está pausada"); 

        require (!isExpired(userAddr), "A conta não pode ser validada porque está expirada");

        require ( isAdmin(userAddr), "A conta a validar deve ter o papel de ADMIN" );
        
        legalEntitiesInfo[userAddr].state = BlockchainAccountState.VALIDATED;

        emit AccountValidation( userAddr, 
                                legalEntitiesInfo[userAddr].RBBId, 
                                legalEntitiesInfo[userAddr].CNPJ, 
                                responsible);
    }   


     /**
    * Pause an account     
    * @param addr Ethereum address that needs to be paused
    */
    function pauseAddressSameOrg(address addr) public onlyIfSenderIsOperational {

        address responsible = msg.sender;

        require (!isInvalidated(addr), "Contas inválidas não podem ser pausadas");
        require (!isPaused(addr), "Conta já está pausada");
        require( isTheSameID(responsible, addr), "Somente conta de mesma organização pode executar esta ação" );

        require ((addr==responsible || !isAdmin(addr)), "Não pode pausar conta de outro ADMIN");

        pauseAddressInternal (addr, 1);

    }

    function pauseAddressAfterMonitoring(address addr) public onlyByResponsibleForActingAfterMonitoring {

        require (!isInvalidated(addr), "Contas inválidas não podem ser pausadas");
        require (!isPaused(addr), "Conta já está pausada");

        pauseAddressInternal (addr, 2);
    }

    function pauseAddressInternal(address addr, uint8 reason) internal {

        legalEntitiesInfo[addr].paused = true;
        
        emit AccountPaused( addr, 
                            legalEntitiesInfo[addr].RBBId,
                            legalEntitiesInfo[addr].CNPJ, 
                            msg.sender,
                            reason);
    }


    function pauseLegalEntitySameOrg() public onlyIfSenderIsOperational {

        address responsible = msg.sender;
        uint rbbId = getIdRaw(responsible);

        address[] memory addresses  = RBBId_addresses[rbbId];

        for (uint i=0; i < addresses.length ; i++) {
            address candidate = addresses[i];
            if( !isInvalidated(candidate) &&
                !isPaused(candidate) ) {
                pauseAddressInternal (candidate, 3);
            }
        }
    }


    function pauseLegalEntityAfterMonitoring(uint RBBId) public onlyByResponsibleForActingAfterMonitoring {

        address[] memory addresses  = RBBId_addresses[RBBId];

        for (uint i=0; i < addresses.length ; i++) {
            address candidate = addresses[i];
            if( !isInvalidated(candidate) &&
                !isPaused(candidate) ) {
                pauseAddressInternal (candidate, 4);
            }
        }   
    }


    /**
    * Unpause an account     
    * @param addr Ethereum address that needs to be validated
    */
    function unpauseAddressSameOrg(address addr) public onlyIfSenderIsOperational {

        address responsible = msg.sender;

        require( isAdmin(responsible), "Somente uma conta ADMIN pode executar esta ação" );

        require ( responsible != addr , "Uma pessoa não é capaz de retirar o pause de sua própria conta");
        require( isTheSameID(responsible, addr), 
                    "Somente pode retirar pausa de uma conta quem for da mesma organização" );
        
        unpauseAddressInternal(addr, 1);        
        
    }

    function unpauseAddressAfterMonitoring(address addr) public onlyByResponsibleForActingAfterMonitoring {
        unpauseAddressInternal(addr,2);        
    }

    function unpauseAddressInternal(address addr, uint8 reason) internal {

        require (!isInvalidated(addr), "Contas inválidas não podem ser retirar pausa");
        require( isPaused(addr), "Somente uma conta pausada pode ser despausada" ); 

        legalEntitiesInfo[addr].paused = false;
        
        emit AccountUnpaused(   addr, 
                                legalEntitiesInfo[addr].RBBId,
                                legalEntitiesInfo[addr].CNPJ, 
                                msg.sender,
                                reason);
    }

    function invalidateYourOwnAddress() public {

        address addr = msg.sender;

        require( !isInvalidated(addr), "A conta foi invalidada previamente." );

        invalidateAddressInternal(addr, 1);

    }

   /**
    * Invalidates the initial registry of a legal entity or the change of its registry
    * @param addr Ethereum address that needs to be invalidated
    */
    function invalidateAddressSameOrg(address addr) public onlyIfSenderIsOperational {

        address responsible = msg.sender;

        require( !isInvalidated(addr), "A conta foi invalidada previamente." );

        require( isTheSameID(responsible, addr) , "Apenas contas da mesma organizacao podem ser invalidadas. ");

        require ((addr==responsible || !isAdmin(addr)), "Não pode invalidar conta de outro ADMIN");

        invalidateAddressInternal(addr, 2);

    }

    function invalidateAddress(address addr) public onlyByResponsibleForRegistryValidation {

        require(isWaitingAccount(addr), "A conta precisa estar no estado Aguardando Validação");

        require( isAdmin(addr), "Só é possível invalidar conta de ADMIN no processo de validação");

        invalidateAddressInternal(addr, 3);

    }


    function invalidateAddressAfterMonitoring(address addr) public onlyByResponsibleForActingAfterMonitoring {

        require( !isInvalidated(addr), "A conta foi invalidada previamente." );
        
        invalidateAddressInternal(addr, 4);
    }

    function invalidateAddressInternal(address addr, uint8 reason) internal {

        legalEntitiesInfo[addr].state = BlockchainAccountState.INVALIDATED;
        
        emit AccountInvalidation(   addr, 
                                    legalEntitiesInfo[addr].RBBId, 
                                    legalEntitiesInfo[addr].CNPJ, 
                                    msg.sender,
                                    reason );
    
    }

    function reactiveForRegularAccounts() public {
        reactiveAccount("0");
    }

    function reactiveAccount(string memory hashProof) public {
        
        address addr = msg.sender;

        require (!isAvailableAccount(addr), "Endereço deve pode ter sido cadastrado anteriormente");
        require (!isInvalidated(addr), "Endereço não pode ter sido invalidado");

        if ( !isZeroHash(hashProof) ) { 
            if (isAdmin(addr)) {
                require (isValidHash(hashProof), "O hash da declaração é inválido");
            }
        }
        else {
            require(!isAdmin(addr), "Contas Admin precisam informar um hash diferente de zero");
        }

        uint256 dateTimeExpiration = now + defaultDeltaDateTimeExpiration;

        legalEntitiesInfo[addr].hashProof = hashProof;
        legalEntitiesInfo[addr].state = BlockchainAccountState.WAITING_VALIDATION;
        legalEntitiesInfo[addr].dateTimeExpiration = dateTimeExpiration;
        legalEntitiesInfo[addr].paused = false;

        emit AccountReactivation(addr, hashProof, dateTimeExpiration);
    }


    /**
    * The Owner can assign new default expiration time for future registries
    * @param deltaDateTimeExpirationNew the new default expiration time 
    */
    function setDefaultDeltaDateTimeExpiration(uint256 deltaDateTimeExpirationNew) onlyOwner public {

        uint256 defaultDeltaDateTimeExpirationOld = defaultDeltaDateTimeExpiration;
        defaultDeltaDateTimeExpiration = deltaDateTimeExpirationNew;
        
        emit RegistryExpirationChange(   msg.sender, 
                                         defaultDeltaDateTimeExpirationOld, 
                                         defaultDeltaDateTimeExpiration );        
    }

    function calculaProximoRBBID(uint64 CNPJ) internal returns (uint) {

        if ( CNPJ_RBBId[CNPJ] == 0 ) //se nao existir rbbid para este CNPJ
            CNPJ_RBBId[CNPJ] = ++currentRBBId;

        return CNPJ_RBBId[CNPJ];
    } 

   function isValidHash(string memory str) pure public returns (bool)  {

        bytes memory b = bytes(str);
        if(b.length != 64) return false;

        for (uint i=0; i<64; i++) {
            if (b[i] < "0") return false;
            if (b[i] > "9" && b[i] <"a") return false;
            if (b[i] > "f") return false;
        }
            
        return true;
    }

    function isZeroHash(string memory str) pure public returns (bool) {
        return (keccak256(bytes(str)) == keccak256(bytes("0")));
    }

    function isOperational(address addr) public view returns (bool) {
        return isValidatedAccount(addr) && !isPaused(addr) && !isExpired(addr);
    }

    function isRegistryOperational(uint RBBId) public view override returns (bool) {
        address[] memory addresses  = RBBId_addresses[RBBId];

        for (uint i=0; i < addresses.length ; i++) {
            if ( isOperational( addresses[i] ) && isAdmin(addresses[i]) ) {
                    return true;
            }
        }
    }

    function getId (address addr) public view override returns (uint) {
        uint RBBId = getIdRaw(addr);
        require ( isRegistryOperational( RBBId ) , "A organização não está operacional" );
        return RBBId;
    }    

    function getIdRaw (address addr) public view override returns (uint) {
        return legalEntitiesInfo[addr].RBBId;
    }

    function getIdFromCNPJ(uint64 cnpj) public view override returns (uint) {
        uint rbbId = getIdFromCNPJRaw(cnpj);
        require ( isRegistryOperational( rbbId ) , "A organização não está operacional" );
        return rbbId;
    }

    function getIdFromCNPJRaw(uint64 cnpj) public view override returns (uint) {
        return CNPJ_RBBId[cnpj];
    }

    function getCNPJbyID(uint Id) public view override returns (uint64 ) {
        require ( isRegistryOperational( Id ) , "A organização não está operacional" );
        return getCNPJbyIDRaw(Id);
    }

    function getCNPJbyIDRaw(uint Id) public view override returns (uint64 ) {
        address addr = RBBId_addresses[Id][0];
        return legalEntitiesInfo[addr].CNPJ;
    }

    function getCNPJ (address addr) public view returns (uint64) {
        getId(addr); //just check if it is operational
        return getCNPJRaw(addr);
    }

    function getCNPJRaw (address addr) public view returns (uint64) {
        return legalEntitiesInfo[addr].CNPJ;
    }

    function getRegistry (address addr) public view override returns (uint, uint64, string memory, uint, uint, bool, uint256) {
        Registry memory reg = legalEntitiesInfo[addr];
        string memory proof = reg.hashProof;
        return (  reg.RBBId,
                  reg.CNPJ, 
                  proof, 
                  (uint) (reg.state),
                  (uint) (reg.role),
                  reg.paused,
                  reg.dateTimeExpiration
                );
    }


    function getBlockchainAccounts(uint RBBId) public view returns (address[] memory) {
        return RBBId_addresses[RBBId];
    }

    function getAccountState(address addr) public view returns (int) {
        return ((int) (legalEntitiesInfo[addr].state));
    }

    function getAccountRole(address addr) public view returns (int) {
        return ((int) (legalEntitiesInfo[addr].role));
    }

    function isExpired (address addr) public view returns (bool) {
        return (legalEntitiesInfo[addr].dateTimeExpiration < now);
    }

    function isOwner(address addr) public view returns (bool) {
        return owner()==addr;
    }

    function isAvailableAccount(address addr) public view returns (bool) {
        return legalEntitiesInfo[addr].state == BlockchainAccountState.AVAILABLE;
    }

    function isWaitingAccount(address addr) public view returns (bool) {
        return legalEntitiesInfo[addr].state == BlockchainAccountState.WAITING_VALIDATION
            || legalEntitiesInfo[addr].state == BlockchainAccountState.WAITING_APPROVAL
            || legalEntitiesInfo[addr].state == BlockchainAccountState.WAITING_REJECTION ;
    }

    function isValidatedAccount(address addr) public view returns (bool) {
        return legalEntitiesInfo[addr].state == BlockchainAccountState.VALIDATED;
    }

    function isInvalidated(address addr) public view returns (bool) {
        return legalEntitiesInfo[addr].state == BlockchainAccountState.INVALIDATED;
    }

    function isTheSameID(address a, address b) public view returns (bool) {
        return legalEntitiesInfo[a].CNPJ == legalEntitiesInfo[b].CNPJ ;
    }

    function isPaused(address addr) public view returns (bool) {
        return legalEntitiesInfo[addr].paused;
    }

    function isAdmin(address addr) public view returns (bool) { 
        return legalEntitiesInfo[addr].role == BlockchainAccountRole.ADMIN;
    }


 


}
