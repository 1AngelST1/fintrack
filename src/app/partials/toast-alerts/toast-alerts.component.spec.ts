import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastAlertsComponent } from './toast-alerts.component';

describe('ToastAlertsComponent', () => {
  let component: ToastAlertsComponent;
  let fixture: ComponentFixture<ToastAlertsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastAlertsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToastAlertsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
