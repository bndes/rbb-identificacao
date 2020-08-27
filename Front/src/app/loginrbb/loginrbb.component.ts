import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Cliente, Subcredito } from './Cliente';
import { Utils } from '../../utils';

@Component({
  selector: 'app-loginrbb',
  templateUrl: './loginrbb.component.html',
  styleUrls: ['./loginrbb.component.css']
})
export class LoginrbbComponent implements OnInit {
   
  constructor() { }

  ngOnInit(): void {
  }
  loginUnicoRetorno() {
    window.open('http://localhost:3000/loginunico/autorizado/');
  }  

 
}
