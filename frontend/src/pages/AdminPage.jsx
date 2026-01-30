import { useState } from 'react';
import { Terminal, Users, Package, DollarSign, Settings, Plus } from 'lucide-react';
import useAppStore from '../store/appStore';

const AdminPage = () => {
  const { isAdminMode } = useAppStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAdminMode) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Terminal className="w-24 h-24 text-gray-600 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-cyber-red font-cyber mb-4">
            Access Denied
          </h1>
          <p className="text-gray-400 font-mono mb-8">
            Admin privileges required to access this area.
          </p>
          <button
            onClick={() => window.history.back()}
            className="cyber-btn"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: Terminal },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'orders', name: 'Orders', icon: DollarSign },
    { id: 'users', name: 'Users', icon: Users },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  const mockStats = {
    totalRevenue: 12450.75,
    totalOrders: 156,
    totalProducts: 23,
    totalUsers: 1204
  };

  const mockRecentOrders = [
    { id: 'ZD-001', customer: 'john@example.com', total: 29.99, status: 'completed' },
    { id: 'ZD-002', customer: 'jane@example.com', total: 49.99, status: 'completed' },
    { id: 'ZD-003', customer: 'bob@example.com', total: 39.99, status: 'pending' }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyber-green font-cyber mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 font-mono">
            AuditSec Management Console
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-cyber-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-mono font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-cyber-green text-cyber-green'
                    : 'border-transparent text-gray-400 hover:text-cyber-green'
                }`}
              >
                <tab.icon className="w-4 h-4 inline mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="cyber-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 font-mono text-sm">Total Revenue</p>
                    <p className="text-2xl font-bold text-cyber-green font-mono">
                      €{mockStats.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-cyber-green" />
                </div>
              </div>

              <div className="cyber-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 font-mono text-sm">Total Orders</p>
                    <p className="text-2xl font-bold text-cyber-blue font-mono">
                      {mockStats.totalOrders}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-cyber-blue" />
                </div>
              </div>

              <div className="cyber-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 font-mono text-sm">Products</p>
                    <p className="text-2xl font-bold text-cyber-accent font-mono">
                      {mockStats.totalProducts}
                    </p>
                  </div>
                  <Package className="w-8 h-8 text-cyber-accent" />
                </div>
              </div>

              <div className="cyber-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 font-mono text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-cyber-green font-mono">
                      {mockStats.totalUsers}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-cyber-green" />
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="cyber-card p-6">
              <h3 className="text-xl font-bold text-cyber-green font-mono mb-6">
                Recent Orders
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-cyber-border">
                      <th className="text-left py-3 px-4 font-mono text-cyber-green">Order ID</th>
                      <th className="text-left py-3 px-4 font-mono text-cyber-green">Customer</th>
                      <th className="text-left py-3 px-4 font-mono text-cyber-green">Total</th>
                      <th className="text-left py-3 px-4 font-mono text-cyber-green">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockRecentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-cyber-border/30">
                        <td className="py-3 px-4 font-mono text-cyber-blue">{order.id}</td>
                        <td className="py-3 px-4 font-mono text-gray-300">{order.customer}</td>
                        <td className="py-3 px-4 font-mono text-cyber-green">€{order.total}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs font-mono rounded ${
                            order.status === 'completed' 
                              ? 'bg-cyber-green/20 text-cyber-green' 
                              : 'bg-cyber-accent/20 text-cyber-accent'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-cyber-green font-mono">
                Product Management
              </h3>
              <button className="cyber-btn">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </button>
            </div>

            <div className="cyber-card p-6">
              <p className="text-gray-400 font-mono text-center py-12">
                Product management interface would be implemented here.
                <br />
                Features: Add, edit, delete products, manage inventory, etc.
              </p>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-cyber-green font-mono">
              Order Management
            </h3>

            <div className="cyber-card p-6">
              <p className="text-gray-400 font-mono text-center py-12">
                Order management interface would be implemented here.
                <br />
                Features: View orders, process refunds, manage downloads, etc.
              </p>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-cyber-green font-mono">
              User Management
            </h3>

            <div className="cyber-card p-6">
              <p className="text-gray-400 font-mono text-center py-12">
                User management interface would be implemented here.
                <br />
                Features: View customers, manage accounts, support tickets, etc.
              </p>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-cyber-green font-mono">
              System Settings
            </h3>

            <div className="cyber-card p-6">
              <p className="text-gray-400 font-mono text-center py-12">
                Settings interface would be implemented here.
                <br />
                Features: Payment settings, email configuration, security, etc.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;