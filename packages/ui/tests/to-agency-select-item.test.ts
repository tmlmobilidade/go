import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { toAgencySelectItem } from '../src/filters/list/to-agency-select-item.ts';

/* * */

describe('toAgencySelectItem', () => {
	it('uses the name as the label and keeps only the id as the detail', () => {
		assert.deepEqual(toAgencySelectItem({ _id: 'ZVBA1', code: '10', name: 'Scotturb' }), {
			description: '[ZVBA1]',
			keywords: '10',
			label: 'Scotturb',
			value: 'ZVBA1',
		});
		assert.deepEqual(toAgencySelectItem({ _id: 'ASNAS', name: 'Carris' }), {
			description: '[ASNAS]',
			label: 'Carris',
			value: 'ASNAS',
		});
		assert.deepEqual(toAgencySelectItem({ _id: '43' }), {
			description: undefined,
			label: '43',
			value: '43',
		});
	});
});
