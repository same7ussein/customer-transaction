import { HttpErrorResponse } from '@angular/common/http';
import { CommonService } from './../../services/common.service';
import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { transaction } from '../../interfaces/customers';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    ChartModule,
  ],
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
})
export class CustomerComponent implements OnInit {
  customerTranscations: transaction[] = [];
  filteredTransactions: transaction[] = [];
  selectedCustomerTransactions: transaction[] = [];

  loading: boolean = true;
  loadingData: boolean = true;
  filter: string = '';
  chartData: any;
  chartOptions: any;
  customerId: number = 1;
  transes: transaction[] = [];
  TotalAmount: number = 0;
  Avg: number = 0;
  minAmount: number | null = null;
  maxAmount: number | null = null;
  selectedCustomerName: string = '';

  constructor(private CommonService: CommonService) {}

  ngOnInit(): void {
    this.getCustomersTransaction();
  }

  getCustomersTransaction(): void {
    this.loading = true;
    this.loadingData = true;
    this.CommonService.getCustomer().subscribe({
      next: (customerData) => {
        this.CommonService.getTransactions().subscribe({
          next: (transactionData) => {
            const customerMap = customerData.reduce(
              (map: any, customer: any) => {
                map[customer.id] = customer.name;
                return map;
              },
              {}
            );

            const updatedTransactions = transactionData.map(
              (transaction: any) => ({
                ...transaction,
                customer_name: customerMap[transaction.customer_id],
              })
            );

            this.customerTranscations = updatedTransactions;
            this.filteredTransactions = updatedTransactions;
            this.loading = false;
            this.loadingData = false;

            if (this.customerId !== null) {
              this.selectedCustomerName = customerMap[this.customerId];
              this.updateChart(this.customerId);
              this.updateSelectedCustomerTransactions(this.customerId);
            }
          },
          error: (err: HttpErrorResponse) => {
            console.log(err);
          },
        });
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      },
    });
  }

  onRowSelect(customerId: number, customerName: string): void {
    this.customerId = customerId;
    this.selectedCustomerName = customerName;

    this.updateChart(customerId);
    this.updateSelectedCustomerTransactions(customerId);
  }

  updateChart(customerId: number): void {
    const filteredTransactions = this.customerTranscations.filter(
      (transaction) => transaction.customer_id === customerId
    );

    this.transes = filteredTransactions;
    this.TotalAmount = filteredTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
    this.Avg = this.TotalAmount / (filteredTransactions.length || 1);

    this.prepareChartData(filteredTransactions);
    this.initializeChartOptions();
  }

  prepareChartData(transactions: transaction[]): void {
    const labels = transactions.map((transaction) => transaction.date);
    const data = transactions.map((transaction) => transaction.amount);

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Transaction Amount',
          data: data,
          backgroundColor: 'red',
          borderColor: '#198754',
          fill: false,
          tension: 0.4,
        },
      ],
    };
  }

  initializeChartOptions(): void {
    this.chartOptions = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          display: true,
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#ffffff', // Set x-axis tick color to white
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.2)', // Optionally change the grid line color
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: '#ffffff', // Set y-axis tick color to white
          },
          grid: {
            color: 'rgba(255, 255, 255, 0.2)', // Optionally change the grid line color
            drawBorder: false,
          },
        },
      },
    };
  }

  filterByAmountRange(): void {
    if (this.minAmount && this.maxAmount) {
      console.log(this.minAmount, this.maxAmount);
      this.filteredTransactions = this.customerTranscations.filter(
        (transaction) =>
          transaction.amount >= this.minAmount! &&
          transaction.amount <= this.maxAmount!
      );
      console.log(this.filteredTransactions);
    } else {
      this.filteredTransactions = this.customerTranscations;
    }
  }
  updateSelectedCustomerTransactions(customerId: number): void {
    const selectedTransactions = this.customerTranscations.filter(
      (transaction) => transaction.customer_id === customerId
    );

    this.selectedCustomerTransactions = selectedTransactions;
    this.TotalAmount = selectedTransactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );
    this.Avg = this.TotalAmount / (selectedTransactions.length || 1);
  }
}
