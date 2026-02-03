import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HomePageSliderFormComponent } from './home-page-slider-form.component';
import { HomePageSliderService } from '../home-page-slider.service';
import { NotificationService } from '../../../core/services/notification.service';
import { of } from 'rxjs';

describe('HomePageSliderFormComponent', () => {
  let component: HomePageSliderFormComponent;
  let fixture: ComponentFixture<HomePageSliderFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePageSliderFormComponent],
      providers: [
        { provide: HomePageSliderService, useValue: { getById: () => of(undefined), create: () => of(null), update: () => of(null) } },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => null }, data: {} } } },
        { provide: Router, useValue: { navigate: () => {} } },
        { provide: NotificationService, useValue: { success: () => {} } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(HomePageSliderFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
