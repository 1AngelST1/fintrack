import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-duplicate-category-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './duplicate-category-modal.component.html',
  styleUrls: ['./duplicate-category-modal.component.scss']
})
export class DuplicateCategoryModalComponent {
  @Input() isOpen: boolean = false;
  @Input() categoryName: string = '';
  @Output() close = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }
}
