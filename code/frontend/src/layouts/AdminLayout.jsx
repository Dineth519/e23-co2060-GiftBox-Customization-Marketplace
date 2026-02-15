import React from 'react';
import Sidebar from '../components/admin/Sidebar';
import TopBar from '../components/admin/TopBar.jsx';

const AdminLayout = ({ children }) => {
  return (
    <div style={{ 
      margin: 0,
      padding: 0,
      height: '100vh',
      width: '100vw',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      
      <TopBar />

      <div style={{
        display: 'flex',
        marginTop: '64px',
        height: 'calc(100vh - 64px)',
        width: '100%'
      }}>
        
        <Sidebar />

        <main style={{ 
          marginLeft: '300px',
          flex: 1,
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundColor: '#b6c818',
          padding: '0',
          margin: '0'
        }}>
          {children}
        </main>

      </div>
      
    </div>
  );
};

export default AdminLayout;