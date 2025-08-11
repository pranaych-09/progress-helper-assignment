import { Component } from '@angular/core';
import { MenuComponent } from '../menu/menu.component';
import { ViewComponent } from '../view/view.component';
import { MatDivider } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { MatTooltip } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EmployeeService } from '../services/employee.service';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MenuComponent, ViewComponent, MatDivider, RouterLink, MatTooltip, MatButtonModule, MatIconModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  selectedEmployee: any;
  constructor(private empService: EmployeeService) { }

  convertToCSV(objArray: any[]): string {
    if (!objArray.length) return '';

    const keys = Object.keys(objArray[0]);
    const header = keys.join(',');
    const rows = objArray.map(row =>
      keys.map(key => {
        const cell = row[key] !== null && row[key] !== undefined ? row[key] : '';
        // Escape commas and double quotes for safety
        return `"${String(cell).replace(/"/g, '""')}"`;
      }).join(',')
    );

    return [header, ...rows].join('\r\n');
  }

  onEmployeeSelected(employee: any) {
    this.selectedEmployee = employee;
    // console.log('Selected Employee:', this.selectedEmployee);
  }

  downloadHelpers() {
    this.empService.getEmployees().subscribe(
      (data: any) => {
        
        console.log('Helpers downloaded successfully:', data);
        const cleanedData = data.map((emp: any) => {
          const { profilePicture, documents, __v, _id, kyc,updatedAt,createdAt,name,typeOfService,organizationName,email,phone,gender,empID,languagesKnown } = emp;

        // Format date to dd-MM-yyyy or any preferred format
        const formattedDate = new Date(createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });

        return {
          EmployeeID : empID,
          Name : name,
          Service : typeOfService,
          Organisation : organizationName,
          Languages:languagesKnown,
          Email : email,
          Phone : phone,
          Gender : gender,
          JoinedOn: formattedDate 
        };
        });
        console.log(cleanedData);
        const csv = this.convertToCSV(cleanedData);

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'helpers.csv';
        a.click();
        window.URL.revokeObjectURL(url);
        console.log('Download initiated');
      },
      (error: any) => {
        console.error('Error downloading helpers:', error);
        alert("some error ocurred")
      }
    );
    // console.log('Downloading helpers...');
  }
}
