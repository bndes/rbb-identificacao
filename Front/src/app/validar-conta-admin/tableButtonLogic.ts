export class TableButtonLogic {
    public  validar(row ,user, isResponsavelPorValidacao){
        if(user===undefined || user.statusAsString==="Invalidada") return false;
        if(user.paused ) return false;
        if(user.roleAsString == "Admin" && row.perfil == "Regular" && user.cnpj== row.cnpj) return true;
        if(isResponsavelPorValidacao == true && row.perfil == "Admin") return true;
        return false;
    }

    public  invalidar(row ,user, isResponsavelPorValidacao){
        return this.validar(row,user,isResponsavelPorValidacao);
     }


    public  pausar(row ,user, isResponsavelPorValidacao,selectedAccount){
        if(row.pausada || user===undefined || user.statusAsString==="Invalidada") return false;
        if(user.paused) return false;
        if(user.roleAsString == "Regular" && selectedAccount==row.contaBlockchain) return true;
        if(user.roleAsString == "Admin" && user.cnpj== row.cnpj){
            if(selectedAccount==row.contaBlockchain) return true;
            if (row.perfil == "Regular") return true;
            
        }
        if(isResponsavelPorValidacao) return true;
        return false;

    }
    public reativar(row ,user, isResponsavelPorValidacao,selectedAccount){
        if(!row.pausada || user===undefined || user.statusAsString==="Invalidada") return false;
        if(user.paused) return false;
        if(user.roleAsString == "Admin" && user.cnpj== row.cnpj) return true;
        if(isResponsavelPorValidacao) return true;
        return false;

    }

    public pauseCNPJ(row ,user){
        if( user==undefined || user.statusAsString==="Invalidada") return false;
        if(user.paused) return false;
        if( user.cnpj == row.cnpj ) return true;
        return false;
    }
    
}

