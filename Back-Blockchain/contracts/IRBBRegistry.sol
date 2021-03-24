pragma solidity ^0.6.0;

interface IRBBRegistry {

    //Verifica se estah operacional antes de retornar
    function getId (address addr) external view returns (uint);

    //Verifica se estah operacional antes de retornar
    function getIdRaw (address addr) external view returns (uint);

    //Verifica se estah operacional antes de retornar
    function getIdFromCNPJ(uint64 cnpj) external view  returns (uint); 

    //Não verifica se estah operacional antes de retornar
    function getIdFromCNPJRaw(uint64 cnpj) external view  returns (uint); 

    //Verifica se estah operacional antes de retornar
    function getCNPJbyID(uint id) external view  returns (uint64);

    //Não verifica se estah operacional antes de retornar
    function getCNPJbyIDRaw(uint id) external view  returns (uint64);

    function isRegistryOperational(uint RBBId) external view  returns (bool); 

    //retorna toda estrutura. Não verifica se estah operacional
    function getRegistry (address addr) external view  returns (uint, uint64, string memory, uint, uint, bool, uint256); 

}