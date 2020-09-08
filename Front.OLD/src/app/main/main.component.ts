import { Component, OnInit } from '@angular/core';
import { Web3Service } from './../Web3Service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})

export class MainComponent implements OnInit {

  address: string;
  id: string;
  accesstoken: string;

  constructor(private http: HttpClient, private web3Service: Web3Service) { }

  ngOnInit() {    
    this.address     = "0xFE3B557E8Fb62b89F4916B721be55cEb828dBd73";
    this.id          = "00000000000191";
    this.accesstoken = "yeJraWQiOiJyc2ExIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI2ODI1NjQwNzA0MiIsImF1ZCI6InRva2VuLWguYm5kZXMuZ292LmJyIiwic2NvcGUiOlsiZW1haWwiLCJnb3Zicl9lbXByZXNhIiwib3BlbmlkIiwicGhvbmUiLCJwcm9maWxlIl0sImFtciI6InBhc3N3ZCIsImlzcyI6Imh0dHBzOlwvXC9zc28uc3RhZ2luZy5hY2Vzc28uZ292LmJyXC8iLCJleHAiOjE1OTcxODAxODUsImlhdCI6MTU5NzE3NjU4NSwianRpIjoiMDMwOTQ4MzYtYTc5Mi00NzUxLWFmMDMtYjg0N2FmYjhlNDU5In0.rjc8ewaaCmuJBSgn0kjTRgbMuYpJJo4l7Ow7UFce3G7FDqSnoQySc1PjVFeKA8MNPsbLURNll7h6rqjVSc6__XUnD_wcIahaG0frxqk3XyY2sHiDld3eyCR0ZP1mZFlWwunNVqWjMF4HnIxS2-nrswsELzO63-R-_V519rBitlrBVP5fYlhX4Yw-pFM2q2khrq_YLDuqCBWHHL1Dd_rU0mEnyn8tK7dxwO0BVTgXw2qFhg3Gd0hl6ye0CHkrotiwl-Hte4oVU4Y1JMxkhscjj30bkupI8wVDtX3N6SAcaQWV1mLsrq9K9useDlv89mav4MKsmFSEsngK63ZffgyIMw";
  }

  storeIDAccessToken() {    
    let cpf = '11111111111';
    let idtoken = 'kfdakjfdakjfdakfdsjkfdajkfldjlkfdsjfdasjlkadfs';
    window.open('http://localhost:3000/storeIDAccessToken/' 
    + this.id  
    + '/' + cpf
    + '/' + this.accesstoken 
    + '/' + idtoken,
    "_blank");
  }    

  prepareAssociacao() {
      console.log(this.address);
      window.open('http://localhost:3000/prepareAssociacao/' + this.address  + '/' + this.id, "_blank");
  }    

  generateDoc() {
      console.log(this.address);
      window.open('http://localhost:3000/generatepdf/' + this.address , "_blank");
  }  

  signDeclaration() {
    alert("Implementar")
  }

  loginUnico() {
    window.open('http://localhost:3000/loginunico/', "_blank");
  }

  loginUnicoRetorno() {
    window.open('http://localhost:3000/loginunico/autorizado/' + this.address, "_blank");
  }  

  backAsyncWeb3() {
    let self = this;
    let url = 'http://localhost:3000/prepareToStoreAssociation/62913820000121/68256407042/eyJraWQiOiJyc2ExIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI2ODI1NjQwNzA0MiIsImF1ZCI6InRva2VuLWguYm5kZXMuZ292LmJyIiwic2NvcGUiOlsiZW1haWwiLCJnb3Zicl9lbXByZXNhIiwib3BlbmlkIiwicGhvbmUiLCJwcm9maWxlIl0sImFtciI6InBhc3N3ZCIsImlzcyI6Imh0dHBzOlwvXC9zc28uc3RhZ2luZy5hY2Vzc28uZ292LmJyXC8iLCJleHAiOjE1OTg2NDI1NjcsImlhdCI6MTU5ODYzODk2NywianRpIjoiODZiNTNlODMtOWIzZC00NDVkLTgzZWMtYmE0YzNjOGU2Yjk0In0.ZOHmxjJMsw4bR1pjvdwILBaFT3u-rOqii2mv49rfj-XQCuwQDOGDVfO8izVlONRODsqdSBua3tbJF6NjVKwJxOTpiuKMoZ3nu2l0uto1DCC3CrNw9uqZDBpfr06kkxeyUXbSCjDOg9ON05mbgDziXhs6vm2wcD56V_Bf-eVgi6RC5jWsLfRaks_JPROkZFb4zlb6tAj740K1Yy11nRYlaoV9D7CEGKhKF6bk35-sbFZATYe1UzYJZrpG5gheRdV0LkT4KUKp1dxmhiNiWWFIfKWHkFONJDDYAfBdp57Gq_PjP91NHedxHKK9iTJ5jvn4qcpK0E0AUx3qMVGcTrt-eg/eyJraWQiOiJyc2ExIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiI2ODI1NjQwNzA0MiIsImVtYWlsX3ZlcmlmaWVkIjoidHJ1ZSIsImFtciI6InBhc3N3ZCIsInByb2ZpbGUiOiJodHRwczpcL1wvc3RhZ2luZy5hY2Vzc28uZ292LmJyIiwia2lkIjoicnNhMSIsImlzcyI6Imh0dHBzOlwvXC9zc28uc3RhZ2luZy5hY2Vzc28uZ292LmJyXC8iLCJwaG9uZV9udW1iZXJfdmVyaWZpZWQiOiJ0cnVlIiwibm9uY2UiOiI2Mzc1MSIsInBpY3R1cmUiOiJodHRwczpcL1wvc3NvLnN0YWdpbmcuYWNlc3NvLmdvdi5iclwvdXNlcmluZm9cL3BpY3R1cmUiLCJhdWQiOiJ0b2tlbi1oLmJuZGVzLmdvdi5iciIsImF1dGhfdGltZSI6MTU5ODYzODk1OSwic2NvcGUiOlsiZW1haWwiLCJnb3Zicl9lbXByZXNhIiwib3BlbmlkIiwicGhvbmUiLCJwcm9maWxlIl0sIm5hbWUiOiJKb8OjbyBUb23DqSBQaW50byBkZSBTb3V6YSBQYWxoYXJlcyIsInBob25lX251bWJlciI6IjMxOTk2NDU1OTcxIiwiZXhwIjoxNTk4NjM5NTY3LCJpYXQiOjE1OTg2Mzg5NjcsImp0aSI6IjE2MTZlMzkwLTIwM2YtNDg5Yi1hZWY1LTIxZjFlY2Q0ODMwOSIsImVtYWlsIjoibGF2b2lzaWVyLnZpZWlyYUBzZXJwcm8uZ292LmJyIn0.f6rInj5RhkvwPN-SmFRL8b2NS99RjvsUjabQYrevp5psxJWSj6GKJo16ZlWffiAtsP-X_hISoT_uuzIVV_ofnscjY4c6J6aynC5QpqjkVDmQDEqCwmapZl4qJCRkwggBJWkyY9kxYPcVTir_1oW0Ojmeb28_xnmFaSdeqvBcAd30giVbYNHX46UeifAOtxjH5WDhzJimfQEc9htGSYAlKQbI1udwtMpskvsbtNIkuZvpZ8iLKj6PP20aVJm8jg2ci9YGZY8mU9YQdAvLwcj4K9cueb4N07Djo0dAzMWhWEeusECH87SsyfwDkcEi01sPAaDIT6-iw9UKFEs0QELXUQ' ;
    console.log(url);
    let resultado =  this.http.get<Object>( url ) ;
    resultado.subscribe(
      data => {
        console.log(data);
        self.nowWeb3();
      },
      error => {
        console.log(error);
      }
    )
   
  }

  nowWeb3() {
    console.log("nowWeb3");
    this.web3Service.web3();
    this.web3Service.liquidaResgate(1, 2, true,

      (txHash) => {
 
       console.log("ok");
      }
      ,(error) => {
        console.log("error");
       });
       console.log("ConfiriarAlertaAcaoUsuario( self.bnAlertsServiceme a operação no metamask e aguarde a liquidação da conta." )

  }

  }
