/* * */

import { main } from '@/main.js';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';

/* * */

await runOnInterval(main, { intervalMs: '10m', throwOnError: false });
