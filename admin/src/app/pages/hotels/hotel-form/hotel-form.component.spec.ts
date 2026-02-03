import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HotelFormComponent } from './hotel-form.component';
import { HotelsService } from '../hotels.service';

describe('HotelFormComponent', () => {
  let component: HotelFormComponent;
  let fixture: ComponentFixture<HotelFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HotelFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        HotelsService,
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null }, data: {} } } },
        { provide: Router, useValue: { navigate: () => {} } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HotelFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
