import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GalleryListComponent } from './gallery-list.component';
import { GalleryService } from '../gallery.service';
import { SwalService } from '../../../core/services/swal.service';
import { NotificationService } from '../../../core/services/notification.service';
import { of } from 'rxjs';

describe('GalleryListComponent', () => {
  let component: GalleryListComponent;
  let fixture: ComponentFixture<GalleryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GalleryListComponent],
      providers: [
        { provide: GalleryService, useValue: { getAll: () => of([]), upload: () => of([]), delete: () => of(true) } },
        { provide: SwalService, useValue: { confirmDelete: () => Promise.resolve(false) } },
        { provide: NotificationService, useValue: { success: () => {} } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(GalleryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
