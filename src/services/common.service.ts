import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  constructor(private http: HttpClient) {}
  getCustomer(): Observable<any> {
    return this.http.get(
      'https://customer-transaction-api.onrender.com/customers'
    );
  }
  getTransactions(): Observable<any> {
    return this.http.get(
      'https://customer-transaction-api.onrender.com/transactions'
    );
  }
}
