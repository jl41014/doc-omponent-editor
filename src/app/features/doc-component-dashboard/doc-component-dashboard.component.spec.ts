import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocComponentDashboardComponent } from './doc-component-dashboard.component';

describe('DocComponentDashboardComponent', () => {
  let component: DocComponentDashboardComponent;
  let fixture: ComponentFixture<DocComponentDashboardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DocComponentDashboardComponent]
    });
    fixture = TestBed.createComponent(DocComponentDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
