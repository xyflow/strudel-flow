import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactFlowProvider } from '@xyflow/react';
// @ts-expect-error - Missing type declarations for @strudel/web
import { initStrudel, samples } from '@strudel/web';
import SidebarLayout from '@/components/layouts/sidebar-layout';
import Workflow from '@/components/workflow';

import './index.css';

initStrudel();
samples('github:tidalcycles/dirt-samples');

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ReactFlowProvider>
      <SidebarLayout>
        <Workflow />
      </SidebarLayout>
    </ReactFlowProvider>
  </React.StrictMode>
);
