
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
import html2canvas from 'html2canvas';
import { QRCodeModule } from 'angularx-qrcode';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { QrDialogComponent } from '../shared/qr-dialog/qr-dialog.component'; // Import your QR dialog component
import { RouterLink } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { BackButtonComponent } from '../shared/back-button/back-button.component';
import { MatStepper } from '@angular/material/stepper';
import { KycUploadDialogComponent } from '../shared/kyc-upload-dialog/kyc-upload-dialog.component';
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
    QRCodeModule,
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
  selectedKycDocType: string = ''; // To store the selected KYC document type
  kycDocumentFile: File | null = null;

  profilePictureFile: File | null = null;
  profilePicturePreview: string | null = null;
  profilePictureName: string = '';

  documentsFiles: Array<{ file: File; customName: string }> = [];
  documentPreviews: Array<string> = [];

  serviceTypes = ['Cleaning', 'Maintenance', 'Security', 'Driving'];
  languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali'];
  organizationNames = ['ASBL', 'Inncircles', 'A2Z Helpers', 'Urban Company'];
  showSuccessModal = false;
  showErrorModal = false;

  joinedOnDate = new Date(); // Or use helperDetailsForm.value.joinedOn


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
      languagesKnown: [[]],
      gender: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]], // Added phone validation
      email: ['', [Validators.email]] // Added email validation

    });

    this.documentsForm = this.fb.group({
      documents: ['']
    });
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
        console.log("KYC file is enti ante : ", result);
        this.kycUploaded = true;
        this.selectedKycDocType = result.documentType;
        this.kycDocumentFile = result.file;
        console.log('KYC uploaded:', result, result.type);
      } else {
        console.log('KYC upload failed', result.type);
        this.kycUploaded = false; // Reset if dialog was closed without action
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
      // this.documentsFiles = selectedFiles.map(file => ({
      //   file,
      //   customName: file.name
      // }));
      this.documentsFiles.push(
        ...selectedFiles.map(file => ({
          file,
          customName: file.name
        }))
      );
    }
  }

  onSubmit() {
    console.log('1');
    if (this.helperDetailsForm.invalid || this.documentsForm.invalid) {
      this.showErrorModal = true;

      return;
    }
    console.log('2');


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
      formData.append('languagesKnown[]', lang);
    });

    // Add profile picture
    if (this.profilePictureFile) {
      formData.append('profilePicture', this.profilePictureFile, this.profilePictureFile.name);
    }

    // Add documents with custom names
    this.documentsFiles.forEach((doc) => {
      formData.append('documents', doc.file, doc.customName || doc.file.name);
    });

    if (this.kycDocumentFile) {
      formData.append('kyc', this.kycDocumentFile, this.kycDocumentFile.name);
    }
    console.log('3');

    console.log('Form data prepared:', formData);
    this.employeeService.createEmployee(formData).subscribe({
      next: (res: any) => {
        console.log('Employee created:', res);
        // alert('Employee created successfully!');
        this.showSuccessModal = true;   // reset form or navigate
        const dialogRef = this.dialog.open(QrDialogComponent, {
          data: { empID: res.empID },
          disableClose: true,
        });

        dialogRef.afterClosed().subscribe(() => {
          this.router.navigate(['/']);
        });
      },
      error: (err: any) => {
        this.showErrorModal = true;
        console.error('Error creating employee:', err);
        alert('Failed to create employee. Please try again.');
        this.showSuccessModal = false;
      }
    });

  }
  downloadQRCode(empID: string) {
    const qrElement = this.qrContainer.nativeElement;
    html2canvas(qrElement).then((canvas) => {
      const link = document.createElement('a');
      link.download = `${empID}_QRCode.png`;
      link.href = canvas.toDataURL();
      link.click();
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