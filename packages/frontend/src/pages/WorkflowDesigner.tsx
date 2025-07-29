import React from 'react';

const WorkflowDesigner: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Workflow Designer
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Visual workflow builder with drag-and-drop interface.
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-500 dark:text-gray-400">
          Workflow designer with React Flow will be implemented here.
        </p>
      </div>
    </div>
  );
};

export default WorkflowDesigner; 