import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewsletterListComponent } from './newsletter-list.component';
import { NewsletterService } from '../newsletter.service';
import { of } from 'rxjs';

describe('NewsletterListComponent', () => {
  let component: NewsletterListComponent;
  let fixture: ComponentFixture<NewsletterListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewsletterListComponent],
      providers: [
        { provide: NewsletterService, useValue: { getAll: () => of([]) } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(NewsletterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});