import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PauseClienteComponent } from './pause-cliente.component';

describe('PauseClienteComponent', () => {
  let component: PauseClienteComponent;
  let fixture: ComponentFixture<PauseClienteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PauseClienteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PauseClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
