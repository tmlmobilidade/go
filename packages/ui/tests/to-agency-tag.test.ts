import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { toAgencyTag } from '../src/components/tags/AgencyTagGroup/to-agency-tag';

/* * */

describe('agency table tags', () => {
	it('shows the short name with full name and id in the tooltip', () => {
		assert.deepEqual(toAgencyTag('IA9T6', { _id: 'IA9T6', code: '1', name: 'Carris', short_name: 'CCFL' }), {
			label: 'CCFL',
			tooltip: 'Carris [IA9T6]',
			variant: 'muted',
		});
	});

	it('falls back to code, then name when short names are unavailable', () => {
		assert.equal(toAgencyTag('A', { _id: 'A', code: '10', name: 'Scotturb', short_name: '' }).label, '10');
		assert.equal(toAgencyTag('A', { _id: 'A', name: 'Scotturb' }).label, 'Scotturb');
	});

	it('keeps unresolved or unloaded agency references visible', () => {
		assert.deepEqual(toAgencyTag('unknown'), { label: 'unknown', tooltip: 'unknown', variant: 'muted' });
		assert.equal(toAgencyTag('A', { _id: 'A', name: '', short_name: '' }).label, 'A');
	});
});
