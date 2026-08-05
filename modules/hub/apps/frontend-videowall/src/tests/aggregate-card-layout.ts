/* * */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/* * */

const cardNames = [
	'DelayCard',
	'DemandCard',
	'ServiceComplianceCard',
	'VkmExecutionCard',
];

for (const cardName of cardNames) {
	const cardStyles = readFileSync(
		new URL(`../cards-new/${cardName}/styles.module.css`, import.meta.url),
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
	new URL('../cards-new/DemandCard/index.tsx', import.meta.url),
	'utf8',
);

assert.match(
	demandCard,
	/!breakdown && value\?\.typical_range/u,
	'Only the aggregate demand card should replace the reference gauge with the operator footer',
);
