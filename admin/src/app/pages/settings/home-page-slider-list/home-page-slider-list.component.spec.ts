import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HomePageSliderListComponent } from './home-page-slider-list.component';
import { HomePageSliderService } from '../home-page-slider.service';
import { SwalService } from '../../../core/services/swal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { of } from 'rxjs';

describe('HomePageSliderListComponent', () => {
  let component: HomePageSliderListComponent;
  let fixture: ComponentFixture<HomePageSliderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePageSliderListComponent],
      providers: [
        { provide: HomePageSliderService, useValue: { getAll: () => of([]) } },
        { provide: Router, useValue: { navigate: () => {} } },
        { provide: SwalService, useValue: { confirmDelete: () => ({ then: (f: (v: boolean) => void) => f(false) }) } },
        { provide: NotificationService, useValue: { success: () => {} } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(HomePageSliderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
