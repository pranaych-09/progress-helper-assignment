import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KycUploadDialogComponent } from './kyc-upload-dialog.component';

describe('KycUploadDialogComponent', () => {
  let component: KycUploadDialogComponent;
  let fixture: ComponentFixture<KycUploadDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KycUploadDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(KycUploadDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
