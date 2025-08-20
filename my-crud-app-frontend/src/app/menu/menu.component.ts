import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../services/employee.service';
import { SearchCardComponent } from '../shared/search-card/search-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/core';
import { MatSelectTrigger } from '@angular/material/select';
import { MatFormField } from '@angular/material/select';
type SortOption = 'nameAsc' | 'nameDesc' | 'empIDAsc' | 'empIDDesc' | null;

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchCardComponent, MatCardModule, MatIcon, MatOption, MatSelectTrigger, MatFormField],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css',
})
export class MenuComponent implements OnInit {
  @Output() employeeSelected = new EventEmitter<any>();
  @Output() employeesListChanged = new EventEmitter<any[]>();
  searchTerm = '';
  selectedServices: string[] = [];
  selectedOrganizations: string[] = [];
  allServices = ['Cleaning', 'Driving', 'Security', 'Maintenance'];
  organizationNames = ['ASBL', 'Inncircles', 'A2Z Helpers', 'Urban Company'];
  showFilter = false;

  sortOption: SortOption = null;

  employees: any[] = [];
  total: number = 0;
  totalEmps : number = 0;
  curr : number = 0;
  selectedEmpID = '';

  page = 0;
  limit = 10;
  loading = false;

  query: any = {};
  constructor(private empService: EmployeeService) { }

  ngOnInit() {
    this.fetchEmployees();
  }
  selectEmployee(emp: any) {
    this.selectedEmpID = emp.empID;
    this.employeeSelected.emit(emp);
  }
  selectEmployeeFromBackend(data: any[]) {
    // this.employees = data;
    if (data.length > 0) {
      this.selectedEmpID = data[0].empID;
      this.employeeSelected.emit(data[0]);
    }

    this.employeesListChanged.emit(this.employees);
  }

  isName(value: string): boolean {
    return /^[a-zA-Z\s]+$/.test(value);
  }
  isEmployeeId(value: string): boolean {
    return /^EMP\d+$/i.test(value);
  }

  isPhone(value: string): boolean {
    return /^[0-9]+$/.test(value);
  }
  buildQuery() {

    const query: any = {};
    this.searchTerm = this.searchTerm.trim();
    if (this.searchTerm) {
      if (this.isEmployeeId(this.searchTerm)) {
        query.empID = this.searchTerm;
      } else if (this.isName(this.searchTerm)) {
        query.name = this.searchTerm;
      } else if (this.isPhone(this.searchTerm)) {
        query.phone = this.searchTerm;
      }
      else {
        query.empID = -1;
      }
      // console.log('Query:', query);
    }

    if (this.selectedServices.length) {
      query.typeOfService = this.selectedServices;
    }
    if (this.selectedOrganizations.length) {
      query.organizationName = this.selectedOrganizations;
    }
    return query;
  }
  fetchEmployees() {
    const queryy = this.buildQuery();
    this.page = 0;
    this.total = 0;
    this.employees = [];
    // this.empService.getEmployees(query, this.page, this.limit).subscribe({
    //   next: (data: any) => {
    //     this.employees = this.sortList(data);
    //     this.total = this.total == 0 ? data.length : this.total;
    //     this.selectEmployeeFromBackend(data);
    //   },
    //   error: (err: any) => {
    //     console.error('Search failed', err);
    //   },
    // });
    this.loadEmployeesPage(queryy, this.page, true);
  }
  onScroll(event: any) {
    const target = event.target;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10) {
      if (this.employees.length < this.curr) {
        const qeueryy = this.buildQuery();
        this.loadEmployeesPage(qeueryy, this.page, false);
      }
      this.employeesListChanged.emit(this.employees);
    }

  }
  loadEmployeesPage(query: any, page: number, emitSelection = false) {
    if (this.loading) return;
    this.loading = true;

    this.empService.getEmployees(query, page, this.limit,this.sortOption).subscribe({
      next: (res: any) => {
        this.employees = [...this.employees, ...res.data];
        this.total = res.total;
        this.page++;
        this.loading = false;
        this.curr = res.currtotal;
        if (emitSelection) {
          this.selectEmployeeFromBackend(this.employees);
        }
      },
      error: (err: any) => {
        console.error('Search failed', err);
      },
    });
  }
  setLimit(){
    console.log("current limit is :",this.limit);
    this.fetchEmployees();
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  toggleService(service: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedServices.push(service);
    } else {
      this.selectedServices = this.selectedServices.filter((s) => s !== service);
    }
  }

  toggleOrganization(organization: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedOrganizations.push(organization);
    } else {
      this.selectedOrganizations = this.selectedOrganizations.filter((o) => o !== organization);
    }
  }

  applyFilter() {
    this.fetchEmployees();
    this.closeFilter();
  }

  closeFilter() {
    this.showFilter = false;
  }
  onSearchInput() {
    this.fetchEmployees();
  }

  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as SortOption;
    this.sortOption = value;
    this.fetchEmployees();
  }

  resetAll() {
    this.searchTerm = '';
    this.sortOption = null;
    this.selectedServices = [];
    this.selectedOrganizations = [];
    this.showFilter = false;
    this.fetchEmployees();
  }
  clearSearch() {
    this.searchTerm = '';
    this.onSearchInput();
  }
  deleteEmployee(empID: string) {
    this.employees = this.employees.filter(emp => emp.empID !== empID);
    this.fetchEmployees();
  }

}