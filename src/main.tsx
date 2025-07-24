import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactFlowProvider } from '@xyflow/react';
import { AppStoreProvider } from '@/store';
import { defaultState } from '@/store/app-store';
import SidebarLayout from '@/components/layouts/sidebar-layout';
import Workflow from '@/components/workflow';

import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ReactFlowProvider>
      <AppStoreProvider initialState={{ ...defaultState }}>
        <SidebarLayout>
          <Workflow />
        </SidebarLayout>
      </AppStoreProvider>
    </ReactFlowProvider>
  </React.StrictMode>
);
