import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidarContaAdminComponent } from './validar-conta-admin.component';

describe('ValidarContaAdminComponent', () => {
  let component: ValidarContaAdminComponent;
  let fixture: ComponentFixture<ValidarContaAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValidarContaAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValidarContaAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
