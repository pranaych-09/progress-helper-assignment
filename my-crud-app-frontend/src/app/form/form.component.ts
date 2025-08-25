
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { EmployeeService } from '../services/employee.service';
import { SuccessModalComponent } from '../shared/success-modal/success-modal.component';
import { Router } from '@angular/router';
import { ViewChild, ElementRef } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { QrDialogComponent } from '../shared/qr-dialog/qr-dialog.component';
import { RouterLink } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { BackButtonComponent } from '../shared/back-button/back-button.component';
import { MatStepper } from '@angular/material/stepper';
import { KycUploadDialogComponent } from '../shared/kyc-upload-dialog/kyc-upload-dialog.component';
import { ServiceType } from '../enums/service-type.enum';
import { Language } from '../enums/language.enum';
import { OrganizationName } from '../enums/organization-name.enum';
@Component({
  selector: 'app-form',
  standalone: true,
  imports: [
    MatDialogModule,
    CommonModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    MatStepperModule,
    KycUploadDialogComponent,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTooltip,
    MatRadioModule,
    SuccessModalComponent,
    RouterLink,
    BackButtonComponent
  ],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent {
  @ViewChild('qrContainer') qrContainer!: ElementRef;
  @ViewChild('stepper') stepper!: MatStepper;
  qrValue: string = '';

  helperDetailsForm: FormGroup;
  documentsForm: FormGroup;

  kycUploaded = false;
  selectedKycDocType: string = '';
  kycDocumentFile: File | null = null;

  profilePictureFile: File | null = null;
  profilePicturePreview: string | null = null;
  profilePictureName: string = '';

  documentsFiles: Array<{ file: File; customName: string }> = [];
  documentPreviews: Array<string> = [];

  serviceTypes = Object.values(ServiceType);
  languages = Object.values(Language);
  organizationNames = Object.values(OrganizationName);

  showSuccessModal = false;
  showErrorModal = false;

  joinedOnDate = new Date();


  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private dialog: MatDialog
  ) {
    console.log('FormComponent initialized');
    this.helperDetailsForm = this.fb.group({
      name: ['', Validators.required],
      typeOfService: ['', Validators.required],
      organizationName: ['', Validators.required],
      languagesKnown: [[], Validators.required],
      gender: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.pattern(/^[^\s@]+@[^\s]+\.[A-Za-z]{2,}$/)]]
    });

    this.documentsForm = this.fb.group({
      documents: ['']
    });
  }

  allowOnlyDigits(event: KeyboardEvent): boolean {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }



  openKycDialog() {
    console.log('Opening KYC upload dialog');
    const dialogRef = this.dialog.open(KycUploadDialogComponent, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      console.log('KYC dialog closed with result:', result);
      if (result !== undefined && result.documentType && result.file) {
        this.kycUploaded = true;
        this.selectedKycDocType = result.documentType;
        this.kycDocumentFile = result.file;
      } else {
        this.kycUploaded = false;
      }
    });
  }

  onFileSelect(event: Event, type: 'profilePicture' | 'documents') {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;

    if (type === 'profilePicture') {
      this.profilePictureFile = input.files[0];
      this.profilePictureName = this.profilePictureFile.name;
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePicturePreview = reader.result as string;
      };
      reader.readAsDataURL(this.profilePictureFile);
    } else {
      const selectedFiles = Array.from(input.files);
      this.documentsFiles.push(
        ...selectedFiles.map(file => ({
          file,
          customName: file.name
        }))
      );
    }
  }

  onSubmit() {
    if (this.helperDetailsForm.invalid || this.documentsForm.invalid) {
      this.showErrorModal = true;

      return;
    }

    const formData = new FormData();

    // Add basic fields
    formData.append('typeOfService', this.helperDetailsForm.value.typeOfService);
    formData.append('organizationName', this.helperDetailsForm.value.organizationName);
    formData.append('name', this.helperDetailsForm.value.name);
    formData.append('gender', this.helperDetailsForm.value.gender);
    formData.append('phone', this.helperDetailsForm.value.phone);
    formData.append('email', this.helperDetailsForm.value.email);

    // Add multiple languages
    this.helperDetailsForm.value.languagesKnown.forEach((lang: string) => {
      formData.append('languagesKnown', lang);
    });

    if (this.profilePictureFile) {
      formData.append('profilePicture', this.profilePictureFile, this.profilePictureFile.name);
    }

    this.documentsFiles.forEach((doc) => {
      formData.append('documents', doc.file, doc.customName
        ? `${doc.customName}${doc.file.name.substring(doc.file.name.lastIndexOf('.'))}`
        : doc.file.name);
    });

    if (this.kycDocumentFile) {
      formData.append('kyc', this.kycDocumentFile, `${this.selectedKycDocType}${this.kycDocumentFile.name.substring(this.kycDocumentFile.name.lastIndexOf('.'))}`);
    }

    this.employeeService.createEmployee(formData).subscribe({
      next: (res: any) => {
        console.log('Employee created:', res);
        this.showSuccessModal = true;
        this.router.navigate(['/']);
        const dialogRef = this.dialog.open(QrDialogComponent, {
          data: { empID: res.empID },
          disableClose: true,
        });
      },
    });

  }


  previewDocument(file: File) {
    console.log('Previewing document:', file);
    const reader = new FileReader();
    reader.onload = () => {
      const blob = new Blob([reader.result as ArrayBuffer], { type: file.type });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    };
    reader.readAsArrayBuffer(file);
  }
}