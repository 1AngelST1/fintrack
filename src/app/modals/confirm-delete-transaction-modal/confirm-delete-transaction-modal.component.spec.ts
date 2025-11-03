import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeleteTransactionModalComponent } from './confirm-delete-transaction-modal.component';

describe('ConfirmDeleteTransactionModalComponent', () => {
  let component: ConfirmDeleteTransactionModalComponent;
  let fixture: ComponentFixture<ConfirmDeleteTransactionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDeleteTransactionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDeleteTransactionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
