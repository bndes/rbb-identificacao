import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RevalidarContaComponent } from './revalidar-conta.component';

describe('RevalidarContaComponent', () => {
  let component: RevalidarContaComponent;
  let fixture: ComponentFixture<RevalidarContaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RevalidarContaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RevalidarContaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
