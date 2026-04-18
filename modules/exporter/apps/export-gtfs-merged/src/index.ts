/* * */

import { main } from '@/main.js';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

await runOnInterval(main, { intervalMs: '1m' });
