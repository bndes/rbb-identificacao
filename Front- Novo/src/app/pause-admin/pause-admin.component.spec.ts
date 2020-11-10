import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PauseAdminComponent } from './pause-admin.component';

describe('PauseAdminComponent', () => {
  let component: PauseAdminComponent;
  let fixture: ComponentFixture<PauseAdminComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PauseAdminComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PauseAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
