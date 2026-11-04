import { runMetrics } from '@tmlmobilidade/go-performance-pckg-scripts';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';

await runOnInterval(() => runMetrics('realtime'), { intervalMs: '30s' });
