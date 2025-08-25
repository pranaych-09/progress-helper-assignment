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
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { OnDestroy } from '@angular/core';


type SortOption = 'nameAsc' | 'nameDesc' | 'empIDAsc' | 'empIDDesc' | '';

interface Service {
  name: string;
  status: boolean;
}
interface Organization {
  name: string;
  status: boolean;
}
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
  allServices = [{ name: 'Cleaning', status: false }, { name: 'Driving', status: false }, { name: 'Security', status: false }, { name: 'Maintenance', status: false }];
  organizationNames = [{ name: 'ASBL', status: false }, { name: 'Inncircles', status: false }, { name: 'A2Z Helpers', status: false }, { name: 'Urban Company', status: false }];

  showFilter = false;

  sortOption: SortOption = '';

  employees: any[] = [];
  total: number = 0;
  totalEmps: number = 0;
  curr: number = 0;
  selectedEmpID = '';

  page = 0;
  limit = 20;
  loading = false;

  query: any = {};

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private empService: EmployeeService) { }

  ngOnInit() {
    this.fetchEmployees();
    this.searchSubject
      .pipe(
        debounceTime(600),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(x => {
        this.fetchEmployees();
      });
  }

  onSearchInput() {
    this.searchSubject.next(this.searchTerm);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
    const allowedRegex = /^[a-zA-Z0-9\s@'.\-&/\\]+$/;
    const mustContainRegex = /[a-zA-Z\s@'.\-&/\\]/;

    return allowedRegex.test(value) && mustContainRegex.test(value);
  }
  isEmployeeId(value: string): boolean {
    return /^EMP\d+$/i.test(value);
  }
  isPhone(value: string): boolean {
    return /^[0-9]+$/.test(value);
  }

  buildQuery() {

    const query: any = {};

    if (this.searchTerm) {
      const tempTerm = this.searchTerm.trim();
      if (this.isEmployeeId(tempTerm)) {
        query.empID = tempTerm;
      } else if (this.isName(tempTerm)) {
        query.name = this.searchTerm;
      } else if (this.isPhone(tempTerm)) {
        query.phone = this.searchTerm;
      }
      else {
        query.empID = -1;
      }
    }

    if (this.selectedServices.length) {
      query.typeOfService = this.selectedServices;
    }

    if (this.selectedOrganizations.length) {
      query.organizationName = this.selectedOrganizations;
    }

    query.page = this.page.toString();
    query.limit = this.limit.toString();
    query.sortOption = this.sortOption;

    return query;
  }

  fetchEmployees() {
    this.page = 0;
    this.total = 0;
    this.employees = [];
    const query = this.buildQuery();
    this.loadEmployeesPage(query, this.page, true);
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

    this.empService.getEmployees(query).subscribe({
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
    });
  }
  setLimit() {
    // console.log("current limit is :", this.limit);
    this.fetchEmployees();
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  toggleService(service: Service, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      service.status = true;
    } else {
      service.status = false;
    }
  }

  toggleOrganization(organization: Organization, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      organization.status = true;
    } else {
      organization.status = false;
    }
  }

  applyFilter() {
    this.selectedServices = this.allServices.filter(service => service.status).map(service => service.name);
    this.selectedOrganizations = this.organizationNames.filter(org => org.status).map(org => org.name);
    this.fetchEmployees();
    this.closeFilter();
  }

  closeFilter() {
    this.showFilter = false;
  }


  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value as SortOption;
    this.sortOption = value;
    this.fetchEmployees();
  }

  resetAll() {
    this.searchTerm = '';
    this.sortOption = '';
    this.selectedServices = [];
    this.selectedOrganizations = [];
    this.showFilter = false;
    this.cleanUpFilters();
    this.fetchEmployees();
  }

  cleanUpFilters() {
    for (const service of this.allServices) {
      service.status = false;
    }
    for (const org of this.organizationNames) {
      org.status = false;
    }
  }

  clearSearch() {
    this.searchTerm = '';
    this.onSearchInput();
  }

  deleteEmployee(empID: string) {
    this.fetchEmployees();
  }

}