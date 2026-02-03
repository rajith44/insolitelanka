import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TourListComponent } from './tour-list.component';
import { ToursService } from '../tours.service';

describe('TourListComponent', () => {
  let component: TourListComponent;
  let fixture: ComponentFixture<TourListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TourListComponent],
      imports: [FormsModule],
      providers: [
        ToursService,
        { provide: Router, useValue: { navigate: () => {} } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TourListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
