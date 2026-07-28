/* * */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/* * */

const metricNumberComponent = readFileSync(
	new URL('../components/MetricNumber/index.tsx', import.meta.url),
	'utf8',
);
const metricNumberStyles = readFileSync(
	new URL('../components/MetricNumber/styles.module.css', import.meta.url),
	'utf8',
);
const metricCardStyles = readFileSync(
	new URL('../components/MetricCard/styles.module.css', import.meta.url),
	'utf8',
);
const metricTimestampStyles = readFileSync(
	new URL('../components/MetricTimestamp/styles.module.css', import.meta.url),
	'utf8',
);
const appFontStyles = readFileSync(
	new URL('../styles/font.css', import.meta.url),
	'utf8',
);
const appLayout = readFileSync(
	new URL('../app/layout.tsx', import.meta.url),
	'utf8',
);

/* * */

assert.match(
	metricNumberComponent,
	/tabularNumbers=\{false\}/u,
	'Animated metrics must retain the original proportional numeral style',
);
assert.match(
	metricNumberStyles,
	/font-family:\s*var\(--font-family\)/u,
	'Animated metrics must use the videowall Inter font token',
);
assert.match(
	metricNumberStyles,
	/font-weight:\s*inherit/u,
	'Animated metrics must inherit their weight from the metric value slot',
);
assert.match(
	metricCardStyles,
	/\.primary\s*\{[^}]*font-weight:\s*900/u,
	'Primary metric values must use the Inter black weight',
);
assert.match(
	metricCardStyles,
	/\.secondary\s*\{[^}]*font-weight:\s*600/u,
	'Secondary metric values must use the Inter semibold weight',
);
assert.match(
	metricTimestampStyles,
	/font-size:\s*13px/u,
	'Metric timestamps must remain legible at videowall distance',
);
assert.match(
	metricTimestampStyles,
	/font-weight:\s*600/u,
	'Metric timestamps must use the Inter semibold weight',
);
assert.match(
	appLayout,
	/const inter = Inter\(\{[\s\S]*variable:\s*'--font-inter'[\s\S]*weight:\s*\['400', '600', '900'\]/u,
	'The videowall must load the required Inter weights through next/font',
);
assert.match(
	appLayout,
	/htmlClassName=\{inter\.variable\}/u,
	'The generated Inter variable class must be attached to the document element',
);
assert.match(
	appFontStyles,
	/--font-family:\s*var\(--font-inter\),\s*sans-serif/u,
	'The videowall font token must use the generated Inter family',
);
assert.match(
	appFontStyles,
	/html,\s*body,\s*body \*\s*\{[^}]*font-family:\s*var\(--font-family\)/u,
	'The videowall Inter rule must outrank the shared universal Work Sans rule',
);
