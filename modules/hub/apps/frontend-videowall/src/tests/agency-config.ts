/* * */

import assert from 'node:assert/strict';

import { AGENCY_ROUTE_CONFIG } from '../agencies/config';
import {
	DEFAULT_NUMBER_ANIMATION_CONFIG,
	getNumberAnimationDuration,
} from '../types/number-animation';

/* * */

assert.deepEqual({
	41: AGENCY_ROUTE_CONFIG[41].agency_id,
	42: AGENCY_ROUTE_CONFIG[42].agency_id,
	43: AGENCY_ROUTE_CONFIG[43].agency_id,
	44: AGENCY_ROUTE_CONFIG[44].agency_id,
	ccfl: AGENCY_ROUTE_CONFIG.ccfl.agency_id,
}, {
	41: 'LA77N',
	42: 'BNA17',
	43: 'YA15B',
	44: 'A2L1N',
	ccfl: 'IA9T6',
});

assert.deepEqual({
	41: AGENCY_ROUTE_CONFIG[41].label,
	42: AGENCY_ROUTE_CONFIG[42].label,
	43: AGENCY_ROUTE_CONFIG[43].label,
	44: AGENCY_ROUTE_CONFIG[44].label,
	ccfl: AGENCY_ROUTE_CONFIG.ccfl.label,
	cm: AGENCY_ROUTE_CONFIG.cm.label,
}, {
	41: 'VA',
	42: 'RL',
	43: 'TST',
	44: 'ALSA',
	ccfl: 'CCFL',
	cm: 'CM',
});

for (const route of Object.values(AGENCY_ROUTE_CONFIG)) {
	assert.deepEqual(route.number_animation, DEFAULT_NUMBER_ANIMATION_CONFIG);
}

assert.equal(getNumberAnimationDuration(DEFAULT_NUMBER_ANIMATION_CONFIG), 800);
assert.equal(getNumberAnimationDuration({
	...DEFAULT_NUMBER_ANIMATION_CONFIG,
	enabled: false,
}), 0);
