export interface Agent {
  name: string;
  completedOrders: number;
  totalOrders: number;
  email?: string;
  extension?: string;
}

export interface Department {
  name: string;
  agents: Agent[];
}

export interface DashboardStats {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
}

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
}

export interface OrderDetails {
  customerName: string;
  ticketNumber: string;
  invoiceNumber?: string;
  note?: string;
}

export interface Order {
  id: string;
  title: string;
  type: string;
  status: 'unassigned' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  details?: OrderDetails;
  tasks: TaskItem[];
  assignedTo?: string;
  createdAt: string;
  completedAt?: string;
}

export const ORDER_TYPES = {
  SIP_TRUNK: 'SIP Trunk',
  RO_CLOUD: 'RO Cloud CPS',
  THREE_CX: '3CX Cloud/On Prem',
  ONE_TIME: 'One Time Order'
} as const;

export const TASK_LISTS = {
  [ORDER_TYPES.SIP_TRUNK]: [
    'CSA Signed',
    'Customer Created',
    'Account Created',
    'DID Provisioned',
    'Subscriptions Added',
    'Discounts Added',
    'Welcome Email Sent',
    'One time charges Invoiced',
    'Project Completed'
  ],
  [ORDER_TYPES.RO_CLOUD]: [
    'CSA Signed',
    'Customer Created',
    'Accounts Created',
    'Inbound Routing Set',
    'Auto Attendant Set',
    'Phones Provisioned',
    'DID Provisioned',
    'Subscriptions Added',
    'Discounts Added',
    'Welcome Email Sent',
    'One time charges Invoiced',
    'Project Completed'
  ],
  [ORDER_TYPES.THREE_CX]: [
    'CSA Signed',
    'Customer Created',
    'Account Created',
    'DID Provisioned',
    '3CX Health & Performance Monitoring',
    '3CX License + Hosting',
    'Remote Phone System Configuration',
    'Subscriptions Added',
    'Discounts Added',
    'Welcome Email Sent',
    'One time charges Invoiced',
    'Project Completed'
  ],
  [ORDER_TYPES.ONE_TIME]: [
    'Ticket Created',
    'Customer Added in QB',
    'Invoice sent',
    'Payment Received',
    'Project Completed'
  ]
} as const;