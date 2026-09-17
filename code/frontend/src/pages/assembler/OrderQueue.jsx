import React from 'react';
import AssemblerDashboard from './Dashboard';
import './OrderQueue.css';

// Share queue rendering and preview behavior with Overview to keep both views consistent.
export default function OrderQueue() {
  return <AssemblerDashboard queueMode />;
}
