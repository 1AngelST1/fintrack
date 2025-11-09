import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-delete-transaction-modal',
  imports: [CommonModule],
  templateUrl: './confirm-delete-transaction-modal.component.html',
  styleUrl: './confirm-delete-transaction-modal.component.scss'
})
export class ConfirmDeleteTransactionModalComponent {
  @Input() isOpen: boolean = false;
  @Input() transactionType: string = '';
  @Input() transactionAmount: number = 0;
  @Input() transactionCategory: string = '';
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

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
