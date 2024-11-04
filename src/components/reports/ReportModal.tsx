import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AgentReport } from './AgentReport';
import { Department, Order } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  reportType: string;
  departments: Department[];
  orders: Order[];
}

export const ReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  reportType,
  departments = [],
  orders = []
}) => {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  if (!isOpen) return null;

  // Ensure departments is initialized and not undefined
  const validDepartments = Array.isArray(departments) ? departments : [];

  const handleAgentSelect = (agentName: string) => {
    setSelectedAgent(agentName);
    // Open in new tab
    const reportWindow = window.open('', '_blank');
    if (reportWindow) {
      reportWindow.document.write(`
        <html>
          <head>
            <title>${reportType} Report - ${agentName}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
          </head>
          <body>
            <div id="report-root"></div>
          </body>
        </html>
      `);

      // Render the report component
      const root = reportWindow.document.getElementById('report-root');
      if (root) {
        root.innerHTML = AgentReport({
          agentName,
          reportType,
          orders: Array.isArray(orders) ? orders : [],
          departments: validDepartments
        });
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{reportType}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          {validDepartments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No departments available</p>
          ) : (
            validDepartments.map((dept) => (
              <div key={dept.name}>
                <h3 className="font-semibold text-gray-700 mb-2">{dept.name}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {dept.agents && dept.agents.length > 0 ? (
                    dept.agents.map((agent) => (
                      <button
                        key={agent.name}
                        onClick={() => handleAgentSelect(agent.name)}
                        className="p-2 text-left hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        {agent.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-gray-500 col-span-2">No agents in this department</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};