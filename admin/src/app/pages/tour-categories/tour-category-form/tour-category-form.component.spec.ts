import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TourCategoryFormComponent } from './tour-category-form.component';
import { TourCategoriesService } from '../tour-categories.service';

describe('TourCategoryFormComponent', () => {
  let component: TourCategoryFormComponent;
  let fixture: ComponentFixture<TourCategoryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TourCategoryFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        TourCategoriesService,
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null }, data: {} } } },
        { provide: Router, useValue: { navigate: () => {} } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TourCategoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
