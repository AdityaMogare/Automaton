import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  CogIcon, 
  ChartBarIcon, 
  PlayIcon,
  DocumentTextIcon,
  ClockIcon,
  UserGroupIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { SidebarItem } from '../../types';

const Sidebar: React.FC = () => {
  const sidebarItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'HomeIcon',
      path: '/',
    },
    {
      id: 'workflows',
      label: 'Workflows',
      icon: 'DocumentTextIcon',
      path: '/workflows',
    },
    {
      id: 'executions',
      label: 'Executions',
      icon: 'PlayIcon',
      path: '/executions',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: 'ChartBarIcon',
      path: '/analytics',
    },
    {
      id: 'team',
      label: 'Team',
      icon: 'UserGroupIcon',
      path: '/team',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'Cog6ToothIcon',
      path: '/settings',
    },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'HomeIcon':
        return <HomeIcon className="w-5 h-5" />;
      case 'DocumentTextIcon':
        return <DocumentTextIcon className="w-5 h-5" />;
      case 'PlayIcon':
        return <PlayIcon className="w-5 h-5" />;
      case 'ChartBarIcon':
        return <ChartBarIcon className="w-5 h-5" />;
      case 'UserGroupIcon':
        return <UserGroupIcon className="w-5 h-5" />;
      case 'Cog6ToothIcon':
        return <Cog6ToothIcon className="w-5 h-5" />;
      default:
        return <CogIcon className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Automaton
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {sidebarItems.map((item) => (
            <li key={item.id}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
              >
                <span className="mr-3">{getIcon(item.icon)}</span>
                {item.label}
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              Demo User
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              demo@example.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 