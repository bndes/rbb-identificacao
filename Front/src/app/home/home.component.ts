
import { Component, OnInit } from '@angular/core';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
   
  

  constructor() { }
  
  loginUnico() {
    window.open('http://localhost:3000/loginunico/');
  }

  
}
