import React from 'react';
import ReactDOM from 'react-dom/client';
import { ReactFlowProvider } from '@xyflow/react';
// @ts-expect-error - Missing type declarations for @strudel/web
import { initStrudel, samples } from '@strudel/web';
import { setSchedulerNow } from '@/lib/strudel-clock';
import AppLayout from '@/components/layouts/app-layout';
import Workflow from '@/components/workflow';

import './index.css';

initStrudel().then((repl: any) => {
  setSchedulerNow(() => repl.scheduler.now());
});
samples('github:tidalcycles/dirt-samples');

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ReactFlowProvider>
      <AppLayout>
        <Workflow />
      </AppLayout>
    </ReactFlowProvider>
  </React.StrictMode>
);
