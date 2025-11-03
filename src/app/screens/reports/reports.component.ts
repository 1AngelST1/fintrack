import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReportsService } from '../../services/reports.service';
import { AuthService } from '../../services/auth.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, BaseChartDirective, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent implements OnInit {
  // Filtros
  fechaDesde: string = '';
  fechaHasta: string = '';
  
  // Usuario actual
  currentUser: any = null;
  isAdmin: boolean = false;

  // Datos para gráfico de pastel (gastos por categoría)
  pieChartData: ChartConfiguration<'pie'>['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#4f8ef7',
        '#e67e22',
        '#27ae60',
        '#e74c3c',
        '#9b59b6',
        '#f39c12',
        '#1abc9c',
        '#34495e',
        '#16a085',
        '#c0392b'
      ]
    }]
  };

  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#f0f0f0',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#f0f0f0',
        bodyColor: '#f0f0f0',
        borderColor: '#4f8ef7',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed ?? 0;
            return `${label}: $${value.toFixed(2)}`;
          }
        }
      }
    }
  };

  // Datos para gráfico de línea (evolución mensual)
  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Ingresos',
        borderColor: '#27ae60',
        backgroundColor: 'rgba(39, 174, 96, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        data: [],
        label: 'Gastos',
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#f0f0f0',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#f0f0f0',
        bodyColor: '#f0f0f0',
        borderColor: '#4f8ef7',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y ?? 0;
            return `${label}: $${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#b0b0b0',
          callback: (value) => '$' + value
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#b0b0b0'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  constructor(
    private reportsService: ReportsService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.currentUser?.rol === 'admin';
    
    // Cargar datos iniciales
    this.loadReports();
  }

  loadReports() {
    const filters: any = {};
    
    // Si no es admin, filtrar por usuarioId
    if (!this.isAdmin && this.currentUser) {
      filters.usuarioId = this.currentUser.id;
    }
    
    // Agregar filtros de fecha si están definidos
    if (this.fechaDesde) {
      filters.fechaDesde = this.fechaDesde;
    }
    if (this.fechaHasta) {
      filters.fechaHasta = this.fechaHasta;
    }

    // Cargar gráfico de pastel (gastos por categoría)
    this.reportsService.getExpensesByCategory(filters).subscribe(data => {
      // Crear nuevo objeto para forzar detección de cambios
      this.pieChartData = {
        labels: Object.keys(data),
        datasets: [{
          data: Object.values(data),
          backgroundColor: [
            '#4f8ef7',
            '#e67e22',
            '#27ae60',
            '#e74c3c',
            '#9b59b6',
            '#f39c12',
            '#1abc9c',
            '#34495e',
            '#16a085',
            '#c0392b'
          ]
        }]
      };
    });

    // Cargar gráfico de línea (evolución mensual)
    this.reportsService.getMonthlyEvolution(filters).subscribe(data => {
      const labels = data.map(d => {
        // Formatear mes: "2024-01" -> "Enero 2024"
        const [year, month] = d.mes.split('-');
        const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        return `${meses[parseInt(month) - 1]} ${year}`;
      });
      
      // Crear nuevo objeto para forzar detección de cambios
      this.lineChartData = {
        labels,
        datasets: [
          {
            data: data.map(d => d.ingresos),
            label: 'Ingresos',
            borderColor: '#27ae60',
            backgroundColor: 'rgba(39, 174, 96, 0.1)',
            tension: 0.4,
            fill: true
          },
          {
            data: data.map(d => d.gastos),
            label: 'Gastos',
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      };
    });
  }

  aplicarFiltros() {
    this.loadReports();
  }

  limpiarFiltros() {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.loadReports();
  }
}
