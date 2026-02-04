import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PhenomenalDealsFormComponent } from './phenomenal-deals-form.component';

describe('PhenomenalDealsFormComponent', () => {
  let component: PhenomenalDealsFormComponent;
  let fixture: ComponentFixture<PhenomenalDealsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PhenomenalDealsFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PhenomenalDealsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
