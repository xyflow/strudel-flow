import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactFlowProvider } from '@xyflow/react';
import AppLayout from '@/components/layouts/app-layout';
import Editor from '@/components/editor/editor';

import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ReactFlowProvider>
      <AppLayout>
        <Editor />
      </AppLayout>
    </ReactFlowProvider>
  </React.StrictMode>
);
