import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsService } from '../../services/reports.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';


@Component({
  selector: 'app-reports',
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})

export class ReportsComponent implements OnInit {
  gastosPorCategoria: any = {};
  chartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: ['#4f8ef7', '#e67e22', '#27ae60', '#e74c3c', '#9b59b6'] }]
  };

  chartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#f0f0f0' } },
    }
  };

  constructor(private reports: ReportsService) {}

  ngOnInit() {
    this.reports.getExpensesByCategory().subscribe(data => {
      this.gastosPorCategoria = data;
      this.chartData.labels = Object.keys(data);
      this.chartData.datasets[0].data = Object.values(data);
    });
  }
}
