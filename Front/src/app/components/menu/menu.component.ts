import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { NgxTippyProps } from 'ngx-tippy-wrapper';
import { Web3Service } from '../../Web3Service';
import 'tippy.js/animations/perspective-extreme.css';
import MetaMaskOnboarding from "@metamask/onboarding"
import { environment } from 'src/environments/environment';
import build from 'src/build';


const onboarding = new MetaMaskOnboarding();

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})



export class MenuComponent implements OnInit {
  @ViewChild('connectButton') connectButton: ElementRef;
  @Output() toggleSideBarForMe: EventEmitter<any> = new EventEmitter();

  public baseProps: NgxTippyProps = {
    placement:'bottom-start',
    animation:'perspective-extreme',
    inertia: true,
    trigger:'mouseenter click',
    theme: 'light',
  };

  templateRef: NgxTippyProps = {
    ...this.baseProps,
    allowHTML: true,
    appendTo: 'parent',
    interactive: true,
    offset: [0,20],

  };

  usuario : any;
  selectedAccount : any;
  events: string[] = [];
  opened: boolean;


  constructor(private web3Service: Web3Service) {

    let self = this;
    setTimeout(() => {  
      setInterval(function () {
        self.recuperaContaSelecionada(),
        1000});
    }, 2030);
//TODO avaliar pra quando for pra producao
    console.log(
      `\n%cBuild Info:\n\n%c ❯ Environment: %c${
          environment.production ? "production 🏭" : "development 🚧"
      }\n%c ❯ Build Version: ${build.version}\n ❯ Build Timestamp: ${
          build.timestamp
      }\n ❯ Built by: ${build.git.user}\n ❯ Commit: ${build.git.hash}\n`,
      "font-size: 14px; color: #7c7c7b;",
      "font-size: 12px; color: #7c7c7b",
      environment.production
          ? "font-size: 12px; color: #95c230;"
          : "font-size: 12px; color: #e26565;",
      "font-size: 12px; color: #7c7c7b"
    );
  }

  ngOnInit():void {

//    this.web3Service.intializeWeb3();

    /* setInterval(async () => {
      this.selectedAccount = await this.web3Service.getCurrentAccountSync();
      console.log(this.selectedAccount);
  }, 5000) */
  }

  toggleSideBar(){
    this.toggleSideBarForMe.emit();
    onboarding.startOnboarding();
  }

  metamaskClick(){
    if (!MetaMaskOnboarding.isMetaMaskInstalled()) {
      this.web3Service.onClickInstall();
    } else {
      this.web3Service.onClickConnect();
    }
  }

  async recuperaContaSelecionada(){
    let self = this;

    let newSelectedAccount = await this.web3Service.getCurrentAccountSync();
    
    if ( !self.selectedAccount || (newSelectedAccount !== self.selectedAccount && newSelectedAccount)) {
      this.selectedAccount = newSelectedAccount;
      console.log(newSelectedAccount);
      console.log("selectedAccount=" + this.selectedAccount);
      try{
        self.usuario = await this.recuperaRegistroBlockchain(this.selectedAccount);
      }
      catch{
        this.selectedAccount = undefined;
      }
      
    }
    
  }

  async recuperaRegistroBlockchain(enderecoBlockchain) : Promise<any> {
    if (enderecoBlockchain != undefined && enderecoBlockchain != null && enderecoBlockchain != "") {
        let usuario = await this.web3Service.getPJInfo(enderecoBlockchain);
        return usuario;
    } else {
        console.log('this.usuario');
        console.log(this.usuario);
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        return undefined;
    }
  }

}
