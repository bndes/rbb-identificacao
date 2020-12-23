import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListacontasComponent } from './listacontas.component';

describe('ListacontasComponent', () => {
  let component: ListacontasComponent;
  let fixture: ComponentFixture<ListacontasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListacontasComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListacontasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
