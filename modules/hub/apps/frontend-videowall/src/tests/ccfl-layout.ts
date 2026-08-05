/* * */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/* * */

const ccflDashboard = readFileSync(
	new URL('../agencies/ccfl/CcflDashboard/index.tsx', import.meta.url),
	'utf8',
);
const ccflVideowall = readFileSync(
	new URL('../agencies/ccfl/CcflVideowall/index.tsx', import.meta.url),
	'utf8',
);
const cmMetricsGrid = readFileSync(
	new URL('../agencies/cm/CmMetricsGrid/index.tsx', import.meta.url),
	'utf8',
);
const aggregateLayoutTest = readFileSync(
	new URL('./aggregate-card-layout.ts', import.meta.url),
	'utf8',
);
const temporaryCardsDirectory = ['cards', 'new'].join('-');

/* * */

assert.match(
	ccflDashboard,
	/<PanelGrid fillContainer>/u,
	'CCFL must use the two-by-two metric grid so chart cards retain enough height',
);
assert.doesNotMatch(
	ccflDashboard,
	/<Clock/u,
	'CCFL must not add a fifth cell to the two-by-two metric grid',
);
assert.match(
	ccflVideowall,
	/<VideowallLayout/u,
	'CCFL must use the shared videowall shell',
);
assert.match(
	ccflVideowall,
	/<VideowallHeader/u,
	'CCFL must use the same header component as CM',
);
assert.doesNotMatch(
	ccflVideowall,
	/<Viewport/u,
	'CCFL must not retain the legacy viewport header',
);

for (const source of [ccflDashboard, cmMetricsGrid, aggregateLayoutTest]) {
	assert.doesNotMatch(
		source,
		new RegExp(temporaryCardsDirectory, 'u'),
		'Videowall code must use the canonical cards directory',
	);
}
