/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';

import { importPlansTask } from './tasks/import-plans.js';

/* * */

await runOnInterval(importPlansTask, { intervalMs: '10m' });
