import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-delete-category-modal',
  imports: [CommonModule],
  templateUrl: './confirm-delete-category-modal.component.html',
  styleUrl: './confirm-delete-category-modal.component.scss'
})
export class ConfirmDeleteCategoryModalComponent {
  @Input() isOpen: boolean = false;
  @Input() categoryName: string = '';
  @Input() hasTransactions: boolean = false;
  @Input() transactionCount: number = 0;
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
