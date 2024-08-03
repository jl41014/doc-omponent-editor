import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CkeditorComponent } from './ckeditor.component';

describe('CkeditorComponent', () => {
  let component: CkeditorComponent;
  let fixture: ComponentFixture<CkeditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CkeditorComponent]
    });
    fixture = TestBed.createComponent(CkeditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
