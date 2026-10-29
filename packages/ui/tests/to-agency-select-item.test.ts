import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { toAgencySelectItem } from '../src/filters/list/to-agency-select-item';

/* * */

describe('toAgencySelectItem', () => {
	it('uses the agency name as the label and the code and id as the detail', () => {
		assert.deepEqual(toAgencySelectItem({ _id: 'ZVBA1', code: '10', name: 'Scotturb', short_name: 'SCT' }), {
			description: '[10] [ZVBA1]',
			keywords: 'ZVBA1 10 SCT Scotturb',
			label: 'Scotturb',
			value: 'ZVBA1',
		});
	});

	it('omits missing codes from details while keeping names and IDs searchable', () => {
		assert.deepEqual(toAgencySelectItem({ _id: 'ASNAS', name: 'Carris' }), {
			description: '[ASNAS]',
			keywords: 'ASNAS Carris',
			label: 'Carris',
			value: 'ASNAS',
		});
	});

	it('keeps partial and unresolved references selectable with an ID label', () => {
		for (const name of [undefined, '']) {
			assert.deepEqual(toAgencySelectItem({ _id: '43', name }), {
				description: undefined,
				keywords: '43',
				label: '43',
				value: '43',
			});
		}
		assert.deepEqual(toAgencySelectItem({ _id: 'A', code: '10' }), {
			description: '[10] [A]',
			keywords: 'A 10',
			label: 'A',
			value: 'A',
		});
	});
});
