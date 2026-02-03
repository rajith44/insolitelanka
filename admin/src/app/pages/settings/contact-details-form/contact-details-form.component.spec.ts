import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ContactDetailsFormComponent } from './contact-details-form.component';
import { ContactDetailService } from '../contact-detail.service';
import { NotificationService } from '../../../core/services/notification.service';
import { of } from 'rxjs';

describe('ContactDetailsFormComponent', () => {
  let component: ContactDetailsFormComponent;
  let fixture: ComponentFixture<ContactDetailsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContactDetailsFormComponent],
      providers: [
        { provide: ContactDetailService, useValue: { get: () => of(null), update: () => of(null) } },
        { provide: Router, useValue: { navigate: () => {} } },
        { provide: NotificationService, useValue: { success: () => {} } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ContactDetailsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
