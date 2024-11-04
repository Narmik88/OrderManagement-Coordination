import { Department, DashboardStats, Order } from './types';

export const dashboardData: { 
  departments: Department[];
  stats: DashboardStats;
  orders: Order[];
} = {
  departments: [
    {
      name: 'Management',
      agents: [
        { name: 'Kashan Chaudhry', completedOrders: 0, totalOrders: 0 },
        { name: 'Saad Munir', completedOrders: 0, totalOrders: 0 },
      ],
    },
    {
      name: 'Support',
      agents: [
        { name: 'Imran Khan', completedOrders: 0, totalOrders: 0 },
        { name: 'Ansar Saleem', completedOrders: 0, totalOrders: 0 },
        { name: 'Shamim Ahmad Roney', completedOrders: 0, totalOrders: 0 },
        { name: 'Waleed Shahzad', completedOrders: 0, totalOrders: 0 },
      ],
    },
    {
      name: 'Sales',
      agents: [
        { name: 'Faiz Khalid', completedOrders: 0, totalOrders: 0 },
        { name: 'Raza Arslan', completedOrders: 0, totalOrders: 0 },
      ],
    },
  ],
  stats: {
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0
  },
  orders: []
};