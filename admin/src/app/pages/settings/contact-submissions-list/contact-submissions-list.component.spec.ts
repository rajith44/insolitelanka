import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContactSubmissionsListComponent } from './contact-submissions-list.component';
import { ContactSubmissionsService } from '../contact-submissions.service';
import { of } from 'rxjs';

describe('ContactSubmissionsListComponent', () => {
  let component: ContactSubmissionsListComponent;
  let fixture: ComponentFixture<ContactSubmissionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContactSubmissionsListComponent],
      providers: [
        { provide: ContactSubmissionsService, useValue: { getAll: () => of([]) } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ContactSubmissionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
