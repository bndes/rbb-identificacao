import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginrbbComponent } from './loginrbb.component';

describe('LoginrbbComponent', () => {
  let component: LoginrbbComponent;
  let fixture: ComponentFixture<LoginrbbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginrbbComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginrbbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
