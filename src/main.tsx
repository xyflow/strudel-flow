import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactFlowProvider } from '@xyflow/react';
import AppLayout from '@/components/layouts/app-layout';
import Editor from '@/components/editor/editor';
import { CollabGate } from '@/collab/collab-gate';

import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ReactFlowProvider>
      <AppLayout>
        <CollabGate>
          <Editor />
        </CollabGate>
      </AppLayout>
    </ReactFlowProvider>
  </React.StrictMode>,
);
