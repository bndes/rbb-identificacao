import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';


export interface UserData {
  id: string;
  name: string;
  address: string;
  timestamp: string;
  situacao: string;
  explorer: string;
}

  
const COLORS: string[] = [
  'maroon', 'red', 'orange', 'yellow', 'olive', 'green', 'purple', 'fuchsia', 'lime', 'teal',
  'aqua', 'blue', 'navy', 'black', 'gray'
];
const NAMES: string[] = [
 '2DU1NFIA3FUBI23UFN2K3FN3WUOIF2UF', 'F31UI23UFN23OVN2OG2UTH23T', 'F123IUFN2IFNUWI3VNGN5UGN45', 
 'FN32OUIFMVOKRMBI5NO5NHU4HN4UOIHN', 'FO23FN234UOFNG3IU5NTTRHBG', 'F2NFNGNTBTYHYHHYHYHYHYYHFG'
];

const SITUACAO: string[] = [
  'VALIDO', 'INVALIDO'
];

const ADDRESS: string[] = [
  'D012DJQ02DJ01FAF31213R2F', '9D23F2F2128HD192RH189F18F', 'D91H298H19T1H9FH9183H918FH1'
];

const TIMESTAMP: string[] = [
  '12:14:14', '12:54:34', '21:14:12'
];



@Component({
  selector: 'app-listacontas',
  templateUrl: './listacontas.component.html',
  styleUrls: ['./listacontas.component.css']
})
export class ListacontasComponent implements OnInit {

  displayedColumns: string[] = ['id', 'name', 'address' , 'timestamp', 'situacao', 'explorer'];
  dataSource: MatTableDataSource<UserData>;

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;

  constructor() {
    const users = Array.from({length: 100}, (_, k) => createNewUser(k + 1));

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(users);

   }

  ngOnInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}

function createNewUser(id: number): UserData {
  
  return {
    id: id.toString(),
    name: NAMES[Math.round(Math.random() * (NAMES.length - 1))],
    address: ADDRESS[Math.round(Math.random() * (ADDRESS.length - 1))],
    timestamp: TIMESTAMP[Math.round(Math.random() * (ADDRESS.length - 1))],
    situacao: SITUACAO[Math.round(Math.random() * (SITUACAO.length - 1))],
    explorer: COLORS[Math.round(Math.random() * (COLORS.length - 1))]
  };
}