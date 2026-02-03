import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MediaPickerComponent } from './media-picker.component';
import { MediaService } from '../../core/services/media.service';
import { NotificationService } from '../../../core/services/notification.service';
import { of } from 'rxjs';

describe('MediaPickerComponent', () => {
  let component: MediaPickerComponent;
  let fixture: ComponentFixture<MediaPickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MediaPickerComponent],
      providers: [
        NgbActiveModal,
        { provide: MediaService, useValue: { getList: () => of({ data: [], meta: { current_page: 1, last_page: 1, per_page: 24, total: 0 } }), upload: () => of([]) } },
        { provide: NotificationService, useValue: { success: () => {}, warning: () => {} } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MediaPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
