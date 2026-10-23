import { runMetrics } from '@tmlmobilidade/go-performance-pckg-scripts';
import { runOnInterval } from '@tmlmobilidade/go-utils-exec';

await runOnInterval(() => runMetrics('hourly'), { intervalMs: '1h' });
