/* * */

import { runOnInterval } from '@tmlmobilidade/go-utils-exec';

import { updatePlanStatisticsTask } from './tasks/update-plan-statistics.js';

/* * */

await runOnInterval(updatePlanStatisticsTask, { intervalMs: '10m' });
