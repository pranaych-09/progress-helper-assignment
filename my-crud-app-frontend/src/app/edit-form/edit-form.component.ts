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
import { API_BASE_URL } from '../app.config';
import { ServiceType } from '../enums/service-type.enum';
import { Language } from '../enums/language.enum';
import { OrganizationName } from '../enums/organization-name.enum';
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
  kycDocumentFile: File | null = null;
  kycDocumentFileURL = '';
  profilePictureFile: File | null = null;
  profilePicturePreview: string | null = null;
  profilePictureOriginal: string = '';

  serviceTypes = Object.values(ServiceType);
  languages = Object.values(Language);
  organizationNames = Object.values(OrganizationName);

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
    this.initForm();
    this.loadEmployee();
  }

  initForm() {
    this.helperDetailsForm = this.fb.group({
      name: ['', Validators.required],
      typeOfService: ['', Validators.required],
      organizationName: ['', Validators.required],
      languagesKnown: [[]],
      gender: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      email: ['', [Validators.pattern(/^[^\s@]+@[^\s]+\.[A-Za-z]{2,}$/)]]
    });
  }

  removeDP() {
    this.profilePictureOriginal = '';
    this.profilePicturePreview = '';
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
    const url = `${API_BASE_URL}/uploads/documents/${filename}`;
    window.open(url, '_blank');
  }


  loadEmployee() {
    this.employeeService.getEmployeeById(this.empID).subscribe({
      next: (emp: any) => {
        this.currEmployee = emp;
        if (emp.documents) {
          this.documentsFiles = emp.documents.map((doc: any) => ({
            ...doc,
            customName: '', 
            file: null      
          }));
        }
        this.helperDetailsForm.patchValue(emp);

        if (emp.languagesKnown?.length) {
          this.helperDetailsForm.patchValue({ languagesKnown: emp.languagesKnown });
        }
        this.profilePictureOriginal = emp.profilePicture;

        this.kycDocumentFile = emp.kyc;
        this.kycUploaded = this.kycDocumentFile ? true : false;
        this.selectedKycDocType = this.kycDocumentFile ? this.kycDocumentFile.name : '';
      }
    });
  }

  previewDocument(doc: any) {
    if (doc instanceof File) {
      const reader = new FileReader();
      reader.onload = () => {
        const blob = new Blob([reader.result as ArrayBuffer], { type: doc.type });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      };
      reader.readAsArrayBuffer(doc);
    }
    else if (doc && doc.path) {
      const url = this.getDocumentUrl(doc.path);
      window.open(url, '_blank');
    }
    else {
      console.error("Invalid document:", doc);
    }
  }

  getDocumentUrl(path: string): string {
    return `${API_BASE_URL}${path.replace(/^.*\/uploads/, '/uploads')}`;
  }

  viewFile() {
    if (this.kycDocumentFile) {
      this.previewDocument(this.kycDocumentFile);
    }

  }

  openKycDialog() {
    const dialogRef = this.dialog.open(KycUploadDialogComponent, {
      width: '500px',
      disableClose: false,
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

    if (!path) {
      return ``;
    }

    return `${API_BASE_URL}${path.replace(/^.*\/uploads/, '/uploads')}`;
  }

  onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input?.files?.length) {
      this.profilePictureFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.profilePicturePreview = reader.result as string;
        this.profilePictureOriginal = '';
      };
      reader.readAsDataURL(this.profilePictureFile);
    }
  }

  getName(doc:any){
    if(doc.file){
      return doc.file.name;
    }
    return doc.name;
  }

  removeDocument(index:number){
      this.documentsFiles.splice(index, 1);
  }

  allowOnlyDigits(event: KeyboardEvent): boolean {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
      return false;
    }
    return true;
  }

  onSubmit() {
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
    } else {
      formData.append('profilePicture', this.profilePictureOriginal);
    }

    if (this.kycDocumentFile instanceof File) {
      formData.append('kyc', this.kycDocumentFile, `${this.selectedKycDocType}${this.kycDocumentFile.name.substring(this.kycDocumentFile.name.lastIndexOf('.'))}`);
    }
    console.log("length of the documents is,",this.documentsFiles.length);
    this.documentsFiles.forEach((doc, i) => {
      if (doc.file) {
        const filename = doc.customName
          ? `${doc.customName}${doc.file.name.substring(doc.file.name.lastIndexOf('.'))}`
          : doc.file.name;

        formData.append('documents', doc.file, filename);
      } else {

        formData.append('documentsMeta', JSON.stringify({
          name: doc.customName ? `${doc.customName}${doc.name.substring(doc.name.lastIndexOf('.'))}` : doc.name,
          path: doc.path
        }));

      }
    });
    if(this.documentsFiles.length==0){
      formData.append("clearDocuments", "true");
    }else{
      formData.append("clearDocuments","false");
    }



    this.employeeService.updateEmployee(this.empID, formData).subscribe({
      next: (data: any) => {
        this.snackBar.open('Helper Edited successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });

        this.router.navigate(['/']);
      }
    });
  }
}
