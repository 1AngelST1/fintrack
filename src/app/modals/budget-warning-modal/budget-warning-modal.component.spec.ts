import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BudgetWarningModalComponent } from './budget-warning-modal.component';

describe('BudgetWarningModalComponent', () => {
  let component: BudgetWarningModalComponent;
  let fixture: ComponentFixture<BudgetWarningModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BudgetWarningModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BudgetWarningModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
