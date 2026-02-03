import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TourFormComponent } from './tour-form.component';
import { ToursService } from '../tours.service';

describe('TourFormComponent', () => {
  let component: TourFormComponent;
  let fixture: ComponentFixture<TourFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TourFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        ToursService,
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null }, data: {} } } },
        { provide: Router, useValue: { navigate: () => {} } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TourFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
