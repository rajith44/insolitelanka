import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TourCategoryListComponent } from './tour-category-list.component';
import { TourCategoriesService } from '../tour-categories.service';

describe('TourCategoryListComponent', () => {
  let component: TourCategoryListComponent;
  let fixture: ComponentFixture<TourCategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TourCategoryListComponent],
      imports: [FormsModule],
      providers: [
        TourCategoriesService,
        { provide: Router, useValue: { navigate: () => {} } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TourCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
