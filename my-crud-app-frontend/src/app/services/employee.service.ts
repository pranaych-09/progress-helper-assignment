
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../app.config';
import { Employee } from '../types/employee.model';
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${API_BASE_URL}/api/employees`;
  private configUrl = `${API_BASE_URL}/config`;

  constructor(private http: HttpClient) {
    console.log('EmployeeService initialized');
  }

  createEmployee(formData: FormData): Observable<Employee> {
    return this.http.post<any>(this.apiUrl, formData);
  }
  getEmployees(filters: any = {}): Observable<Employee[]> {
    return this.http.get<any[]>(this.apiUrl, {
      params: { ...filters }
    });
  }
  getEmployeeById(id: string): Observable<Employee> {
    return this.http.get<any>(`${this.apiUrl}/get/${id}`);
  }
  updateEmployee(empID: string, updates: any): Observable<Employee> {
    return this.http.put<any>(`${this.apiUrl}/${empID}`, updates);
  }
  getConfig(): Observable<{ secretKey: string }> {
    return this.http.get<{ secretKey: string }>(this.configUrl);
  }
  getBrokenEndpoint():Observable<any>{
    // return this.http.get(`${API_BASE_URL}/employees/broken`);
    return this.http.get(`${API_BASE_URL}/test-error`)
  }
  deleteEmployee(empID:string):Observable<any>{
    return this.http.delete(`${this.apiUrl}/${empID}`);
  }
}
