import React from 'react';
import { 
  PlayIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  ClockIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const Dashboard: React.FC = () => {
  const stats = [
    {
      name: 'Total Workflows',
      value: '24',
      change: '+12%',
      changeType: 'positive',
      icon: DocumentTextIcon,
    },
    {
      name: 'Active Executions',
      value: '8',
      change: '+3',
      changeType: 'positive',
      icon: PlayIcon,
    },
    {
      name: 'Successful Runs',
      value: '1,234',
      change: '+8.2%',
      changeType: 'positive',
      icon: CheckCircleIcon,
    },
    {
      name: 'Failed Runs',
      value: '23',
      change: '-12%',
      changeType: 'negative',
      icon: ExclamationTriangleIcon,
    },
  ];

  const recentExecutions = [
    {
      id: '1',
      workflowName: 'Email Notification Workflow',
      status: 'completed',
      duration: '2.3s',
      timestamp: '2 minutes ago',
    },
    {
      id: '2',
      workflowName: 'Data Processing Pipeline',
      status: 'running',
      duration: '1.2s',
      timestamp: '5 minutes ago',
    },
    {
      id: '3',
      workflowName: 'Approval Chain',
      status: 'failed',
      duration: '0.8s',
      timestamp: '10 minutes ago',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your workflows.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-gray-400" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <span
                className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${
                  stat.changeType === 'positive'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
              >
                {stat.change}
              </span>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                from last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Executions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Recent Executions
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentExecutions.map((execution) => (
              <div key={execution.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-3 ${
                        execution.status === 'completed'
                          ? 'bg-green-500'
                          : execution.status === 'running'
                          ? 'bg-blue-500'
                          : 'bg-red-500'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {execution.workflowName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {execution.timestamp}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {execution.duration}
                    </p>
                    <p
                      className={`text-xs capitalize ${
                        execution.status === 'completed'
                          ? 'text-green-600 dark:text-green-400'
                          : execution.status === 'running'
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {execution.status}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Quick Actions
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <DocumentTextIcon className="w-4 h-4 mr-2" />
              Create New Workflow
            </button>
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <ChartBarIcon className="w-4 h-4 mr-2" />
              View Analytics
            </button>
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <ClockIcon className="w-4 h-4 mr-2" />
              View Executions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 