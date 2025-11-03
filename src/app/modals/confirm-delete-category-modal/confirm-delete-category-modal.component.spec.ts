import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmDeleteCategoryModalComponent } from './confirm-delete-category-modal.component';

describe('ConfirmDeleteCategoryModalComponent', () => {
  let component: ConfirmDeleteCategoryModalComponent;
  let fixture: ComponentFixture<ConfirmDeleteCategoryModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDeleteCategoryModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmDeleteCategoryModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
