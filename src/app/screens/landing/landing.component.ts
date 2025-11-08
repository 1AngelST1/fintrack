import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

@Component({
  selector: 'app-landing',
  imports: [RouterLink, CommonModule, BaseChartDirective],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss'
})
export class LandingComponent  {
  // Características destacadas
  features = [
    {
      icon: '📊',
      title: 'Reportes Detallados',
      description: 'Visualiza tus finanzas con gráficos interactivos y reportes personalizados'
    },
    {
      icon: '💰',
      title: 'Control de Gastos',
      description: 'Categoriza tus gastos y mantén un seguimiento en tiempo real'
    },
    {
      icon: '🎯',
      title: 'Metas Financieras',
      description: 'Establece presupuestos y alcanza tus objetivos de ahorro'
    },
    {
      icon: '🔒',
      title: 'Seguro y Privado',
      description: 'Tus datos están protegidos con encriptación de nivel empresarial'
    },
    {
      icon: '📱',
      title: 'Multiplataforma',
      description: 'Accede desde cualquier dispositivo, en cualquier momento'
    },
    {
      icon: '⚡',
      title: 'Rápido y Fácil',
      description: 'Interfaz intuitiva para que empieces en minutos'
    }
  ];

  // Testimonios
  testimonials = [
    {
      name: 'María González',
      role: 'Emprendedora',
      photo: '👩‍💼',
      comment: 'Fintrack2 me ayudó a organizar las finanzas de mi negocio. ¡Increíble!'
    },
    {
      name: 'Carlos Ruiz',
      role: 'Freelancer',
      photo: '👨‍💻',
      comment: 'Ahora tengo control total sobre mis ingresos y gastos mensuales.'
    },
    {
      name: 'Ana Martínez',
      role: 'Estudiante',
      photo: '👩‍🎓',
      comment: 'Perfecto para llevar el control de mi presupuesto universitario.'
    }
  ];

  // Estadísticas de impacto
  stats = [
    { value: '10K+', label: 'Usuarios Activos' },
    { value: '$5M+', label: 'Transacciones Gestionadas' },
    { value: '99.9%', label: 'Uptime' },
    { value: '4.8★', label: 'Calificación' }
  ];

  // Configuración del gráfico de ejemplo
  public chartData: ChartConfiguration['data'] = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ingresos',
        data: [4200, 5300, 4800, 6100, 7200, 6800],
        borderColor: '#27ae60',
        backgroundColor: 'rgba(39, 174, 96, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Gastos',
        data: [3200, 3800, 3500, 4200, 4800, 4400],
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#000000',
          font: { size: 12 }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: { color: '#000000' }
      },
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: { color: '#000000' }
      }
    }
  };


}
