import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TransactionsService } from '../../services/transactions.service';
import { AuthService } from '../../services/auth.service';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Movimiento } from '../../shared/interfaces/movimiento';
import { Usuario } from '../../shared/interfaces/usuario';
import { CurrencyFormatPipe } from '../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, BaseChartDirective, RouterLink, CurrencyFormatPipe, DateFormatPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  // Usuario actual
  currentUser: Usuario | null = null;
  isAdmin: boolean = false;

  // Balance mensual
  ingresos = 0;
  gastos = 0;
  balance = 0;
  loading = true;

  // Transacciones recientes
  transaccionesRecientes: Movimiento[] = [];

  // Mes actual
  mesActual: string = '';

  // Gráfica de barras
  barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: ['Ingresos', 'Gastos'],
    datasets: [{
      data: [0, 0],
      label: 'Balance Mensual',
      backgroundColor: ['#27ae60', '#e74c3c'],
      borderColor: ['#229954', '#c0392b'],
      borderWidth: 2
    }]
  };

  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        labels: {
          color: '#ecf0f1'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        callbacks: {
          label: (context) => {
            const value = context.parsed.y ?? 0;
            return `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#ecf0f1',
          callback: (value) => `$${value}`
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#ecf0f1'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  constructor(
    private tx: TransactionsService,
    private auth: AuthService
  ) {
    this.currentUser = this.auth.getCurrentUser();
    this.isAdmin = this.currentUser?.rol === 'admin';
  }

  ngOnInit() {
    this.setMesActual();
    this.loadBalanceMensual();
    this.loadTransaccionesRecientes();
  }

  setMesActual() {
    const hoy = new Date();
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    this.mesActual = `${meses[hoy.getMonth()]} ${hoy.getFullYear()}`;
  }

  //Cargar balance del mes actual

  loadBalanceMensual() {
    this.loading = true;

    // Calcular primer y último día del mes
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    // Preparar filtros
    const filters: any = {
      fechaDesde: primerDia,
      fechaHasta: ultimoDia
    };

    // Si no es admin, filtrar por usuario actual
    if (!this.isAdmin && this.currentUser?.id) {
      filters.usuarioId = this.currentUser.id;
    }

    // Obtener datos filtrados y calcular sumas
    this.tx.getFilteredAndSum(filters).subscribe({
      next: (res) => {
        this.ingresos = res.ingresos;
        this.gastos = res.gastos;
        this.balance = res.balance;

        // Actualizar gráfica
        this.barChartData.datasets[0].data = [this.ingresos, this.gastos];

        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar balance:', err);
        this.loading = false;
      }
    });
  }

  loadTransaccionesRecientes() {
    const filters: any = { limit: 5 };

    // Si no es admin, filtrar por usuario actual
    if (!this.isAdmin && this.currentUser?.id) {
      filters.usuarioId = this.currentUser.id;
    }

    this.tx.getAll(filters).subscribe({
      next: (list) => {
        this.transaccionesRecientes = list.slice(0, 5);
      },
      error: (err) => {
        console.error('Error al cargar transacciones recientes:', err);
      }
    });
  }

 
  getTipoClass(tipo: string): string {
    return tipo === 'Ingreso' ? 'ingreso' : 'gasto';
  }

  getBalanceMessage(): string {
    if (this.balance > 0) {
      return '¡Excelente! Tienes un superávit';
    } else if (this.balance < 0) {
      return '¡Cuidado! Tienes un déficit';
    } else {
      return 'Tu balance está equilibrado';
    }
  }

  getBalanceIcon(): string {
    if (this.balance > 0) return '📈';
    if (this.balance < 0) return '📉';
    return '⚖️';
  }
}
