import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-duplicate-budget-modal',
  imports: [CommonModule],
  templateUrl: './duplicate-budget-modal.component.html',
  styleUrl: './duplicate-budget-modal.component.scss'
})
export class DuplicateBudgetModalComponent {
  @Input() isOpen: boolean = false;
  @Input() categoryName: string = '';
  @Input() existingAmount: number = 0;
  @Input() existingPeriod: string = '';
  
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.onClose();
    }
  }
}
