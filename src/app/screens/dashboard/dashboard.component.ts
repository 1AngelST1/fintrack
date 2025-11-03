import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../services/reports.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})

export class DashboardComponent implements OnInit {
  ingresos = 0;
  gastos = 0;
  balance = 0;

  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Ingresos', 'Gastos'],
    datasets: [{ data: [0, 0], label: 'Balance Mensual', backgroundColor: ['#27ae60', '#e74c3c'] }]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
    }
  };

  constructor(private reports: ReportsService) {}

  ngOnInit() {
    this.reports.getMonthlyBalance().subscribe(data => {
      this.ingresos = data.ingresos;
      this.gastos = data.gastos;
      this.balance = data.balance;

      this.barChartData.datasets[0].data = [this.ingresos, this.gastos];
    });
  }
}
