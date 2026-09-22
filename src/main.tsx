import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactFlowProvider } from '@xyflow/react';
import AppLayout from '@/components/layouts/app-layout';
import Workflow from '@/components/workflow';

import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ReactFlowProvider>
      <AppLayout>
        <Workflow />
      </AppLayout>
    </ReactFlowProvider>
  </React.StrictMode>
);
