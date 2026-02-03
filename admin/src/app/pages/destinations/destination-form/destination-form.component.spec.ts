import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DestinationFormComponent } from './destination-form.component';
import { DestinationsService } from '../destinations.service';

describe('DestinationFormComponent', () => {
  let component: DestinationFormComponent;
  let fixture: ComponentFixture<DestinationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DestinationFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        DestinationsService,
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null }, data: {} } } },
        { provide: Router, useValue: { navigate: () => {} } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DestinationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
