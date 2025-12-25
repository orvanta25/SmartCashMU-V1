'use client';

import { Link } from 'react-router-dom';
import { ACCList } from '../../../../../components/dashboard_user/inventory/ACCList';

export default function StockAccListPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <Link
          to="/dashboard_user/inventory/acc"
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Nouveau ACC</span>
        </Link>
      </div>
      <ACCList />
    </div>
  );
}