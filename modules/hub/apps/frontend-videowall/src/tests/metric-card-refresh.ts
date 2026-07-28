/* * */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/* * */

const metricCardStyles = readFileSync(
	new URL('../components/MetricCard/styles.module.css', import.meta.url),
	'utf8',
);

/* * */

assert.doesNotMatch(
	metricCardStyles,
	/\.container\[data-validating="true"\]\s*\{[^}]*opacity/u,
	'Background metric revalidation must not change card opacity',
);
