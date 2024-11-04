import React, { useState } from 'react';
import { PlusCircle, FileText, Settings } from 'lucide-react';
import { NewOrderModal } from './NewOrderModal';
import { ReportModal } from './reports/ReportModal';
import { Order, ORDER_TYPES, Department } from '../types';
import { useNavigate } from 'react-router-dom';

interface Props {
  onOrderCreate?: (order: Omit<Order, 'id'>) => void;
  departments: Department[];
  orders: Order[];
}

export const ActionButtons: React.FC<Props> = ({ onOrderCreate, departments, orders }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedOrderType, setSelectedOrderType] = useState<string | null>(null);
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleOrderTypeSelect = (type: string) => {
    setSelectedOrderType(type);
  };

  const handleReportTypeSelect = (type: string) => {
    setSelectedReportType(type);
  };

  const handleModalClose = () => {
    setSelectedOrderType(null);
    setSelectedReportType(null);
  };

  const handleOrderCreate = (order: Omit<Order, 'id'>) => {
    onOrderCreate?.(order);
    handleModalClose();
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <>
      <div className="flex gap-4 mb-8 relative">
        <div className="relative">
          <button
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            onClick={() => setOpenDropdown(openDropdown === 'new' ? null : 'new')}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            New
          </button>
          {openDropdown === 'new' && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
              {Object.values(ORDER_TYPES).map((type) => (
                <button
                  key={type}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                  onClick={() => handleOrderTypeSelect(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            onClick={() => setOpenDropdown(openDropdown === 'reports' ? null : 'reports')}
          >
            <FileText className="w-5 h-5 mr-2" />
            Reports
          </button>
          {openDropdown === 'reports' && (
            <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
              {['Weekly Report', 'Monthly Report', 'Quarterly Report', 'Annual Report'].map((type) => (
                <button
                  key={type}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                  onClick={() => handleReportTypeSelect(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          onClick={handleSettingsClick}
        >
          <Settings className="w-5 h-5 mr-2" />
          Settings
        </button>
      </div>

      <NewOrderModal
        isOpen={!!selectedOrderType}
        onClose={handleModalClose}
        onSubmit={handleOrderCreate}
        orderType={selectedOrderType || ''}
      />

      <ReportModal
        isOpen={!!selectedReportType}
        onClose={handleModalClose}
        reportType={selectedReportType || ''}
        departments={departments}
        orders={orders}
      />
    </>
  );
};