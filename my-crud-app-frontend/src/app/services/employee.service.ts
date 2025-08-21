
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../app.config';
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = `${API_BASE_URL}/api/employees`;
  private configUrl = `${API_BASE_URL}/config`; 

  constructor(private http: HttpClient) {
    console.log('EmployeeService initialized');
  }

  createEmployee(formData: FormData): Observable<any> {
    return this.http.post<any>(this.apiUrl, formData);
  }
  getEmployees(filters: any = {}, page: number, limit: number,sortOption:any): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {
      params: {
        ...filters,
        page:page.toString(),
        limit:limit.toString(),
        sortOption
      }
    });
  }
  getEmployeeById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/get/${id}`);
  }
  updateEmployee(empID: string, updates: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${empID}`, updates);
  }

  getConfig(): Observable<{ secretKey: string }> {
  return this.http.get<{ secretKey: string }>(this.configUrl);
}
}
