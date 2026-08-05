/* * */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/* * */

const i18nResources = readFileSync(
	new URL('../i18n/resources.ts', import.meta.url),
	'utf8',
);

/* * */

assert.match(
	i18nResources,
	/registerModuleTranslations\('default',\s*\{\s*es:\s*namespaceDefaultEs,\s*pt:\s*namespaceDefaultPt,?\s*\}\);/u,
	'App translations must be registered synchronously before server and client rendering',
);
