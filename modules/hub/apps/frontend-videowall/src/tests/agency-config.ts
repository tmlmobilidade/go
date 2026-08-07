/* * */

import assert from 'node:assert/strict';

import { AGENCY_INFO, AGENCY_ROUTE_CONFIG } from '../agencies/config';
import { getAgencyLogo } from '../lib/agency-logo';
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
	ttsl: AGENCY_ROUTE_CONFIG.ttsl.agency_id,
}, {
	41: 'LA77N',
	42: 'BNA17',
	43: 'YA15B',
	44: 'A2L1N',
	ccfl: 'IA9T6',
	ttsl: 'LTP61',
});

assert.deepEqual({
	41: AGENCY_ROUTE_CONFIG[41].short_name,
	42: AGENCY_ROUTE_CONFIG[42].short_name,
	43: AGENCY_ROUTE_CONFIG[43].short_name,
	44: AGENCY_ROUTE_CONFIG[44].short_name,
	ccfl: AGENCY_ROUTE_CONFIG.ccfl.short_name,
	cm: AGENCY_ROUTE_CONFIG.cm.short_name,
}, {
	41: 'VA',
	42: 'RL',
	43: 'TST',
	44: 'ALSA',
	ccfl: 'CCFL',
	cm: 'CM',
});

for (const route of Object.values(AGENCY_ROUTE_CONFIG)) {
	const agencyInfo = AGENCY_INFO[route.agency_id];
	assert.equal(route.logo_slug, agencyInfo.logo_slug);
	assert.equal(route.name, agencyInfo.name);
	assert.equal(route.short_name, agencyInfo.short_name);
	assert.deepEqual(route.number_animation, DEFAULT_NUMBER_ANIMATION_CONFIG);
}

assert.ok(
	getAgencyLogo('LTP61', '180x120', 'light')
		.endsWith('/navegante-agency-logo-ttsl-180x120-light.png'),
);

assert.equal(getNumberAnimationDuration(DEFAULT_NUMBER_ANIMATION_CONFIG), 800);
assert.equal(getNumberAnimationDuration({
	...DEFAULT_NUMBER_ANIMATION_CONFIG,
	enabled: false,
}), 0);
