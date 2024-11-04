import React from 'react';
import { Download } from 'lucide-react';
import { db } from '../../services/supabase';

export const DatabaseExport: React.FC = () => {
  const handleExport = async () => {
    try {
      // Fetch all data
      const orders = await db.getAllOrders();
      const departments = await db.getAllDepartments();
      const stats = await db.getStats();

      // Create CSV content
      const csvContent = [
        // Headers
        ['Ticket Number', 'Customer Name', 'Status', 'Priority', 'Type', 'Assigned To', 'Created Date', 'Completed Date'].join(','),
        // Data rows
        ...orders.map(order => [
          order.details?.ticketNumber || '',
          order.details?.customerName || '',
          order.status,
          order.priority,
          order.type,
          order.assignedTo || '',
          new Date(order.createdAt).toLocaleDateString(),
          order.completedAt ? new Date(order.completedAt).toLocaleDateString() : ''
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `ringoffice_orders_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      console.error('Error exporting database:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Export Database</h2>
      
      <div className="bg-gray-50 rounded-lg p-6">
        <p className="text-gray-600 mb-4">
          Download a spreadsheet containing all order information, including both open and closed cards.
        </p>
        
        <button
          onClick={handleExport}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Download className="w-5 h-5 mr-2" />
          Download Database
        </button>
      </div>
    </div>
  );
};