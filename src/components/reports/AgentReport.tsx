import { Department, Order } from '../../types';

interface Props {
  agentName: string;
  reportType: string;
  orders: Order[];
  departments: Department[];
}

const getDateRange = (reportType: string): { start: Date; end: Date } => {
  const end = new Date();
  const start = new Date();

  switch (reportType) {
    case 'Weekly Report':
      start.setDate(end.getDate() - 7);
      break;
    case 'Monthly Report':
      start.setMonth(end.getMonth() - 1);
      break;
    case 'Quarterly Report':
      start.setMonth(end.getMonth() - 3);
      break;
    case 'Annual Report':
      start.setFullYear(end.getFullYear() - 1);
      break;
  }

  return { start, end };
};

export const AgentReport = ({ agentName, reportType, orders, departments }: Props): string => {
  const { start, end } = getDateRange(reportType);
  
  const agentOrders = orders.filter(order => 
    order.assignedTo === agentName &&
    new Date(order.createdAt) >= start &&
    new Date(order.createdAt) <= end
  );

  const openOrders = agentOrders.filter(order => order.status === 'in-progress').length;
  const completedOrders = agentOrders.filter(order => order.status === 'completed').length;
  const pastDueOrders = agentOrders.filter(order => {
    if (order.status !== 'completed') {
      const createdDate = new Date(order.createdAt);
      const dueDate = new Date(createdDate);
      dueDate.setDate(dueDate.getDate() + 7); // Assuming 7 days as due period
      return new Date() > dueDate;
    }
    return false;
  }).length;

  const chartData = {
    labels: ['Open Orders', 'Completed Orders', 'Past-due Orders'],
    datasets: [{
      data: [openOrders, completedOrders, pastDueOrders],
      backgroundColor: ['#60A5FA', '#34D399', '#F87171']
    }]
  };

  const tableRows = agentOrders.map(order => `
    <tr class="border-b">
      <td class="py-2 px-4">${order.details?.ticketNumber || 'N/A'}</td>
      <td class="py-2 px-4">${order.status}</td>
      <td class="py-2 px-4">${order.priority}</td>
      <td class="py-2 px-4">${new Date(order.createdAt).toLocaleDateString()}</td>
      <td class="py-2 px-4">${order.completedAt ? new Date(order.completedAt).toLocaleDateString() : 'N/A'}</td>
      <td class="py-2 px-4">${order.details?.customerName || 'N/A'}</td>
      <td class="py-2 px-4">${order.type}</td>
    </tr>
  `).join('');

  return `
    <div class="p-8 max-w-6xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">${reportType} - ${agentName}</h1>
      <p class="text-gray-600 mb-4">Period: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}</p>

      <div class="grid grid-cols-2 gap-8 mb-8">
        <div class="space-y-4">
          <div class="bg-blue-50 p-4 rounded-lg">
            <h3 class="font-semibold text-blue-700">Open Orders</h3>
            <p class="text-2xl font-bold text-blue-800">${openOrders}</p>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <h3 class="font-semibold text-green-700">Completed Orders</h3>
            <p class="text-2xl font-bold text-green-800">${completedOrders}</p>
          </div>
          <div class="bg-red-50 p-4 rounded-lg">
            <h3 class="font-semibold text-red-700">Past-due Orders</h3>
            <p class="text-2xl font-bold text-red-800">${pastDueOrders}</p>
          </div>
        </div>

        <div>
          <canvas id="orderChart"></canvas>
          <script>
            new Chart(document.getElementById('orderChart'), {
              type: 'pie',
              data: ${JSON.stringify(chartData)},
              options: {
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }
            });
          </script>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="py-2 px-4 text-left">Ticket Number</th>
              <th class="py-2 px-4 text-left">Status</th>
              <th class="py-2 px-4 text-left">Priority</th>
              <th class="py-2 px-4 text-left">Created Date</th>
              <th class="py-2 px-4 text-left">Completed Date</th>
              <th class="py-2 px-4 text-left">Customer</th>
              <th class="py-2 px-4 text-left">Type</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    </div>
  `;
};