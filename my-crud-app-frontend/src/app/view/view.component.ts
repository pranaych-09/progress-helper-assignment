import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card'; // optional but helps if you're using <mat-card>
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DeleteConfirmDialogComponent } from '../shared/dialog-box/dialog-box.component';
import { RouterLink } from '@angular/router';
import { QrDialogComponent } from '../shared/qr-dialog/qr-dialog.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-view',
  standalone: true,
  imports: [MatSnackBarModule, RouterLink, QrDialogComponent, CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatDialogModule, DeleteConfirmDialogComponent, RouterLink],
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css'],
})
export class ViewComponent {
  @Input() employee: any;
  @Output() helperDeleted = new EventEmitter<string>();
  constructor(private snackBar: MatSnackBar, private dialog: MatDialog, private router: Router) {
    
  }

  qrcode() {
    const dialogRef = this.dialog.open(QrDialogComponent, {
      data: { empID: this.employee.empID },
      disableClose: false
    });

  }

  getProfilePictureUrl(): string {
    const path = this.employee?.profilePicture;
    if (!path) {
      const formatted = (this.employee.name);
      return `https://ui-avatars.com/api/?name=${formatted}&background=random&color=fff&rounded=true&length=2`;
    }

    return `http://localhost:3000${path.replace(/^.*\/uploads/, '/uploads')}`;
  }


  getDocumentUrl(path: string): string {
    return `http://localhost:3000${path.replace(/^.*\/uploads/, '/uploads')}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  onEdit() {
    console.log('Edit Employee ID:', this.employee._id);
    // this.router.navigate(['/form', this.employee._id]);  
  }

  onDelete() {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent,
      {
        data: { employee: this.employee },
        disableClose: false
      }
    );

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        fetch(`http://localhost:3000/api/employees/${this.employee.empID}`, {
          method: 'DELETE',
        })
          .then((res) => res.json())
          .then(() => {
            this.snackBar.open('Helper deleted successfully', 'Close', { duration: 3000,horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-success'] });
            this.helperDeleted.emit(this.employee.empID);
          })
          .catch((err) => {
            console.error(err);
            this.snackBar.open('Error deleting helper', 'Close', { duration: 3000,horizontalPosition: 'right',
          verticalPosition: 'top',
          panelClass: ['snackbar-error'] });
          });
      }

    });
  }
}
