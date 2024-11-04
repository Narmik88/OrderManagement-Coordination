import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { DashboardStats as DashboardStatsType } from '../types';
import { DepartmentColumn } from './DepartmentColumn';
import { Department } from '../types';

interface Props {
  stats: DashboardStatsType;
  departments: Department[];
  onAgentClick: (agentName: string) => void;
  onDepartmentClick: (departmentName: string) => void;
}

export const DashboardStats: React.FC<Props> = ({ 
  stats, 
  departments,
  onAgentClick,
  onDepartmentClick
}) => {
  const data = [
    { name: 'Completed', value: stats.completedOrders },
    { name: 'Pending', value: stats.pendingOrders },
  ];

  const COLORS = ['#4F46E5', '#EF4444'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <div className="flex flex-wrap gap-6">
        <div className="flex gap-6 flex-1">
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <div className="w-64">
                <h3 className="text-lg font-semibold mb-2">Overall Progress</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-indigo-600 mr-2"></div>
                    <span className="text-sm">Completed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-sm">Pending</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <h3 className="text-indigo-600 font-semibold text-sm">Total Orders</h3>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <h3 className="text-green-600 font-semibold text-sm">Completed Orders</h3>
                  <p className="text-2xl font-bold">{stats.completedOrders}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <h3 className="text-red-600 font-semibold text-sm">Pending Orders</h3>
                  <p className="text-2xl font-bold">{stats.pendingOrders}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Departments</h3>
            <div className="grid grid-cols-3 gap-4">
              {departments.map((department) => (
                <div key={department.name} className="bg-gray-50 p-3 rounded-lg">
                  <h4 
                    className="text-sm font-semibold text-indigo-600 mb-2 cursor-pointer hover:text-indigo-800"
                    onClick={() => onDepartmentClick(department.name)}
                  >
                    {department.name}
                  </h4>
                  <div className="space-y-2">
                    {department.agents.map((agent) => (
                      <div key={agent.name} className="text-sm">
                        <div className="flex justify-between items-center">
                          <span 
                            className="font-medium cursor-pointer hover:text-indigo-600"
                            onClick={() => onAgentClick(agent.name)}
                          >
                            {agent.name}
                          </span>
                          <span className="text-gray-600">{agent.completedOrders}/{agent.totalOrders}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-indigo-600 h-1.5 rounded-full"
                            style={{
                              width: `${agent.totalOrders ? (agent.completedOrders / agent.totalOrders) * 100 : 0}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};