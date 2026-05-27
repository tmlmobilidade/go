/* * */

import { loadEta } from '@tmlmobilidade/go-eta-pckg-loader';
import { runOnInterval } from '@tmlmobilidade/utils';

import { AppConfig } from './config.js';

/* * */

runOnInterval(loadEta(AppConfig), { intervalMs: AppConfig.syncInterval });
