/* * */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { getDemandReferenceDeviationRange } from '../utils/demand-reference-range';

/* * */

const cardNames = [
	'DelayCard',
	'DemandCard',
	'ServiceComplianceCard',
	'VkmExecutionCard',
];

for (const cardName of cardNames) {
	const cardStyles = readFileSync(
		new URL(`../cards/${cardName}/styles.module.css`, import.meta.url),
		'utf8',
	);

	assert.match(
		cardStyles,
		/\.container\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;/u,
		`${cardName} must preserve the original agency card layout`,
	);
	assert.match(
		cardStyles,
		/\.container\[data-layout="aggregate"\]\s*\{[^}]*display:\s*grid;[^}]*grid-template-rows:\s*auto auto minmax\(92px, 1fr\) clamp\(58px, 7vh, 70px\);/u,
		`${cardName} must reserve an independent footer row in aggregate mode`,
	);
}

const demandCard = readFileSync(
	new URL('../cards/DemandCard/index.tsx', import.meta.url),
	'utf8',
);

assert.match(
	demandCard,
	/!breakdown && value\?\.typical_range/u,
	'Only the aggregate demand card should replace the reference gauge with the operator footer',
);

const referenceDeviationRange = getDemandReferenceDeviationRange({
	comparison_index_pct: 85,
	deviation_status: 'typical',
	passenger_validations_qty_last_week: 100,
	passenger_validations_qty_now: 85,
	typical_comparison_index_pct: 85,
	typical_cumulative_qty: 100,
	typical_range: { lower: 80, upper: 110 },
});

assert.ok(referenceDeviationRange);
assert.ok(Math.abs(referenceDeviationRange.lower - (-20)) < Number.EPSILON);
assert.ok(Math.abs(referenceDeviationRange.upper - 10) < 1e-10);
