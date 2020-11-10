import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociaContaAdminComponent } from './associa-conta-admin.component';

describe('AssociaContaAdminComponent', () => {
  let component: AssociaContaAdminComponent;
  let fixture: ComponentFixture<AssociaContaAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociaContaAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociaContaAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
