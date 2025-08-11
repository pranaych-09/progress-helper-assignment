import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { KycUploadDialogComponent } from '../shared/kyc-upload-dialog/kyc-upload-dialog.component';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatIconModule } from '@angular/material/icon';
import { EmployeeService } from '../services/employee.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { QRCodeModule } from 'angularx-qrcode';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { BackButtonComponent } from '../shared/back-button/back-button.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-form',
  templateUrl: './edit-form.component.html',
  styleUrls: ['../form/form.component.scss'],
  standalone: true,
  imports: [
    MatSnackBarModule,
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
    QRCodeModule,
    RouterLink,
    BackButtonComponent
  ]
})
export class EditFormComponent implements OnInit {

  empID!: string;
  helperDetailsForm!: FormGroup;

  currEmployee: any;
  kycUploaded = false;
  selectedKycDocType: string = '';
  kycDocumentFile: any = null;
  kycDocumentFileURL = '';
  profilePictureFile: File | null = null;
  profilePicturePreview: string | null = null;
  profilePictureOriginal: string | null = null;

  serviceTypes = ['Cleaning', 'Maintenance', 'Security', 'Driving'];
  languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali'];
  organizationNames = ['ASBL', 'Inncircles', 'A2Z Helpers', 'Urban Company'];

  activeTab: 'helper' | 'documents' = 'helper';

  documentsFiles: any[] = [];

  showSuccessModal = false;
  showErrorModal = false;
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  setActive(tab: 'helper' | 'documents') {
    this.activeTab = tab;
  }
  ngOnInit(): void {
    this.empID = this.route.snapshot.paramMap.get('empID')!;
    // console.log("we gonna edit",this.empID);
    this.initForm();
    this.loadEmployee();
    // console.log("photo is as this : ",this.profilePicturePreview);
  }

  initForm() {
    this.helperDetailsForm = this.fb.group({
      name: ['', Validators.required],
      typeOfService: ['', Validators.required],
      organizationName: ['', Validators.required],
      languagesKnown: [[]],
      gender: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.email]]
    });
  }

  onDocumentSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach(file => {
        this.documentsFiles.push({
          file,
          customName: '',
          originalName: file.name,
          path: null // no server path yet
        });
      });
    }
  }

  getDocument(path: string) {

    const filename = path.split('/').pop(); // extract filename

    // Construct frontend-accessible URL
    const url = `http://localhost:3000/uploads/documents/${filename}`;
    window.open(url, '_blank');
  }


  loadEmployee() {
    this.employeeService.getEmployeeById(this.empID).subscribe({
      next: (emp: any) => {
        // console.log(emp);
        this.currEmployee = emp;
        // console.log("herreee", this.currEmployee);
        if (emp.documents) {
          this.documentsFiles = emp.documents.map((doc: any) => ({
            ...doc,
            customName: '', // default empty, can be edited by user
            file: null      // no File object for existing docs
          }));
        }
        this.helperDetailsForm.patchValue(emp);

        if (emp.languagesKnown?.length) {
          this.helperDetailsForm.patchValue({ languagesKnown: emp.languagesKnown });
        }
        // console.log(emp.profilePicture);
        this.profilePictureOriginal = emp.profilePicture;
        this.kycDocumentFile = emp.kyc;
        this.kycUploaded = this.kycDocumentFile ? true : false;
      },
      error: (err: any) => {
        console.error('Failed to load employee', err);
      }
    });
  }

  viewFile() {
    if (this.kycDocumentFile && this.kycDocumentFile.path) {
      console.log("BUTTON CLICKED");
      console.log(this.kycDocumentFile);

      const backendPath = this.kycDocumentFile.path; // absolute path
      const filename = backendPath.split('/').pop(); // extract filename

      // Construct frontend-accessible URL
      const url = `http://localhost:3000/uploads/documents/${filename}`;
      window.open(url, '_blank');
    }
  }

  openKycDialog() {
    const dialogRef = this.dialog.open(KycUploadDialogComponent, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result?.documentType && result?.file) {
        this.kycUploaded = true;
        this.selectedKycDocType = result.documentType;
        this.kycDocumentFile = result.file;
      }
    });
  }

  getProfilePictureUrl(): string {
    const path = this.profilePictureOriginal;
    console.log("bhAAi", path);
    const fallback = '/uploads/profile-pics/default.jpg';

    if (!path) return `http://localhost:3000${fallback}`;

    return `http://localhost:3000${path.replace(/^.*\/uploads/, '/uploads')}`;
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.profilePictureFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePicturePreview = reader.result as string;
        this.profilePictureOriginal = null;
      };
      reader.readAsDataURL(this.profilePictureFile);
    }
  }

  onSubmit() {
    // console.log("JAI BABU ANALI AKKADA");
    console.log(this.helperDetailsForm);
    if (this.helperDetailsForm.invalid) return;

    const formData = new FormData();
    const formValue = this.helperDetailsForm.value;

    Object.keys(formValue).forEach(key => {
      if (Array.isArray(formValue[key])) {
        formValue[key].forEach((item: any) => formData.append(`${key}[]`, item));
      } else {
        formData.append(key, formValue[key]);
      }
    });

    if (this.profilePictureFile) {
      formData.append('profilePicture', this.profilePictureFile);
    }

    if (this.kycDocumentFile instanceof File) {
      formData.append('kyc', this.kycDocumentFile, this.kycDocumentFile.name);
    } else if (this.kycUploaded && typeof this.kycDocumentFile === 'object' && this.kycDocumentFile.path) {
      formData.append('kycPath', this.kycDocumentFile.path);
      formData.append('kycDocumentType', this.kycDocumentFile.documentType || '');
    }



    this.employeeService.updateEmployee(this.empID, formData).subscribe({
      next: (data: any) => {
        console.log("edited the helper")
        this.snackBar.open('Helper Edited successfully!', 'Close', {
          duration: 3000, 
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });

        this.router.navigate(['/']);
      },
      error: (err: any) => {
        console.log("could not edit the helper")
        this.snackBar.open('Failed to Edit helper. Please try again.', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
        this.showErrorModal = true;
      }
    });
  }
}
