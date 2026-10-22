import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { filterSelectOptions } from '../src/components/inputs/Select/filter-select-options';
import { toAgencySelectItem } from '../src/filters/list/to-agency-select-item';

/* * */

const carris = toAgencySelectItem({ _id: 'IA9T6', code: '10', name: 'Carris', short_name: 'CCFL' });
const cp = toAgencySelectItem({ _id: 'N18KL', code: '3', name: 'Comboios de Portugal', short_name: 'CP' });

describe('filterSelectOptions', () => {
	it('keeps the all-agencies action visible before the option limit', () => {
		const allAgencies = { label: 'Todas as agências', pinned: true, value: '*' };
		const agencies = Array.from({ length: 60 }, (_, index) => ({ label: `Agency ${60 - index}`, value: String(index) }));
		const result = filterSelectOptions({ limit: 50, options: [...agencies, allAgencies], search: '' });
		assert.equal(result.length, 50);
		assert.deepEqual(result[0], allAgencies);
		assert.deepEqual(result.slice(1).map(item => 'label' in item ? item.label : ''), Array.from({ length: 49 }, (_, index) => `Agency ${index + 1}`));
		assert.deepEqual(filterSelectOptions({ limit: 50, options: [...agencies, allAgencies], search: 'todas' }), [allAgencies]);
		assert.deepEqual(filterSelectOptions({ limit: 50, options: [...agencies, allAgencies], search: 'agency 60' }), [agencies[0]]);
	});

	it('sorts alphabetically before limiting, without mutating the input', () => {
		const options = [cp, carris];
		assert.deepEqual(filterSelectOptions({ limit: 1, options, search: '' }), [carris]);
		assert.deepEqual(filterSelectOptions({ limit: 50, options, search: 'c' }), [carris, cp]);
		assert.deepEqual(options, [cp, carris]);
	});

	it('sorts grouped options alphabetically', () => {
		assert.deepEqual(filterSelectOptions({ limit: 50, options: [{ group: 'Agencies', items: [cp, carris] }], search: '' }), [{ group: 'Agencies', items: [carris, cp] }]);
	});

	it('finds agencies by name, short name, code and id', () => {
		for (const search of [' carris ', 'ccfl', '10', 'ia9t6']) {
			assert.deepEqual(filterSelectOptions({ limit: 50, options: [carris, cp], search }), [carris]);
		}
	});

	it('preserves groups and applies the limit across groups and plain options', () => {
		assert.deepEqual(filterSelectOptions({ limit: 1, options: [{ group: 'Agencies', items: [carris, cp] }, cp], search: '' }), [{ group: 'Agencies', items: [carris] }]);
		assert.deepEqual(filterSelectOptions({ limit: 50, options: [{ group: 'Agencies', items: [carris] }, cp], search: 'portugal' }), [cp]);
	});

	it('keeps plain options searchable and handles no results', () => {
		assert.deepEqual(filterSelectOptions({ limit: 25, options: [{ label: 'Example', value: 'example' }], search: 'example' }), [{ label: 'Example', value: 'example' }]);
		assert.deepEqual(filterSelectOptions({ limit: 25, options: [carris], search: 'missing' }), []);
	});
});
