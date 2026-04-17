/* * */

import { main } from '@/main.js';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

await runOnInterval(main, 60_000); // 1 minute
