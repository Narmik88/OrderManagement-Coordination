import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Department } from '../types';

interface Props {
  department: Department;
}

export const DepartmentColumn: React.FC<Props> = ({ department }) => {
  const COLORS = ['#4F46E5', '#EF4444'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4 text-indigo-600">{department.name}</h3>
      <div className="space-y-6">
        {department.agents.map((agent) => (
          <div key={agent.name} className="border-b pb-4 last:border-b-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{agent.name}</p>
                <p className="text-sm text-gray-600">
                  {agent.completedOrders} / {agent.totalOrders} orders
                </p>
              </div>
              <div className="w-16 h-16">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: agent.completedOrders },
                        { name: 'Pending', value: agent.totalOrders - agent.completedOrders },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={30}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {[0, 1].map((index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};