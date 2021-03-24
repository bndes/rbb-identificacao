import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { NgxTippyProps } from 'ngx-tippy-wrapper';
import { Web3Service } from '../../Web3Service';
import 'tippy.js/animations/perspective-extreme.css';
import MetaMaskOnboarding from "@metamask/onboarding"


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

  }

  ngOnInit():void {

    this.web3Service.intializeWeb3();
    
    setInterval(async () => {
      this.selectedAccount = await this.web3Service.getCurrentAccountSync();
      console.log(this.selectedAccount);
      this.usuario = await this.recuperaRegistroBlockchain(this.selectedAccount);
  }, 5000)
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

  async recuperaRegistroBlockchain(enderecoBlockchain) : Promise<any> {
    if (enderecoBlockchain != undefined && enderecoBlockchain != null && enderecoBlockchain != "") {
        let usuario = await this.web3Service.getPJInfo(enderecoBlockchain);
        return usuario;
    } else {
        console.log('this.usuario');
        console.log(this.usuario);
        return undefined;
    }
  }

}
