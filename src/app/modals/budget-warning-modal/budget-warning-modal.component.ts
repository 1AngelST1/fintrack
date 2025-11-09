import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-budget-warning-modal',
  imports: [CommonModule],
  templateUrl: './budget-warning-modal.component.html',
  styleUrl: './budget-warning-modal.component.scss'
})
export class BudgetWarningModalComponent {
  @Input() isOpen: boolean = false;
  @Input() categoryName: string = '';
  @Input() budgetLimit: number = 0;
  @Input() currentSpent: number = 0;
  @Input() newAmount: number = 0;
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  get totalAfterTransaction(): number {
    return this.currentSpent + this.newAmount;
  }

  get exceedsBy(): number {
    return this.totalAfterTransaction - this.budgetLimit;
  }

  get percentageUsed(): number {
    return (this.totalAfterTransaction / this.budgetLimit) * 100;
  }

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onCancel();
    }
  }
}
