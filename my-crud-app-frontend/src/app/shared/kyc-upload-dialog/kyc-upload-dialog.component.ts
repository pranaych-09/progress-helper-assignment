import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon, MatIconModule } from '@angular/material/icon';
@Component({
  standalone: true,
  selector: 'app-kyc-upload-dialog',
  templateUrl: './kyc-upload-dialog.component.html',
  styleUrls: ['./kyc-upload-dialog.component.scss'],
  imports: [ 
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatOptionModule,
    MatIconModule
  ]
    
})
export class KycUploadDialogComponent {

  selectedDocType: string = '';
  selectedFile: File | null = null;

  documentTypes: string[] = ['Aadhar Card', 'PAN Card', 'Passport', 'Driving License'];

  constructor(private dialogRef: MatDialogRef<KycUploadDialogComponent>) {}

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  viewFile() {
    if (this.selectedFile) {
      const fileURL = URL.createObjectURL(this.selectedFile);
      window.open(fileURL, '_blank');
    }
  }

  uploadDocument() {
    this.dialogRef.close({
      documentType: this.selectedDocType,
      file: this.selectedFile
    });
  }
}
