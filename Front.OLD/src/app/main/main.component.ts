import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})

export class MainComponent implements OnInit {

  address: string;
  id: string;
  accesstoken: string;

  constructor() { }

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

}
