import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { Web3Service } from '../../Web3Service';


@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {
 
  @Output() toggleSideBarForMe: EventEmitter<any> = new EventEmitter();

  usuario : any;
  selectedAccount : any;
  events: string[] = [];
  opened: boolean;

  constructor(private web3Service: Web3Service) { 
    
  }

  ngOnInit():void { 

    setInterval(async () => {
      this.selectedAccount = await this.web3Service.getCurrentAccountSync();
      console.log(this.selectedAccount);
      this.usuario = await this.recuperaRegistroBlockchain(this.selectedAccount);
  }, 5000)
  }

  toggleSideBar(){
    this.toggleSideBarForMe.emit();
  }
  
  async recuperaRegistroBlockchain(enderecoBlockchain) : Promise<any> {
    if (enderecoBlockchain != undefined && enderecoBlockchain != null) {
        let usuario = await this.web3Service.getPJInfoSync(enderecoBlockchain);
        return usuario;
    } else {
        console.log('this.usuario');
        console.log(this.usuario);
        return undefined;
    }
    
}  

  
}
