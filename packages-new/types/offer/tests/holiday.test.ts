import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { CreateHolidaySchema, HolidaySchema, UpdateHolidaySchema } from '../src/dates/holiday.js';

/* * */

describe('holiday validation', () => {
	it('accepts the create form fields without server-owned audit fields', () => {
		const result = CreateHolidaySchema.safeParse({ agency_ids: ['agency'], title: '25 de Abril' });
		assert.equal(result.success, true);
	});

	it('requires at least one agency when creating a holiday', () => {
		assert.equal(CreateHolidaySchema.safeParse({ title: '25 de Abril' }).success, false);
		assert.equal(CreateHolidaySchema.safeParse({ agency_ids: [], title: '25 de Abril' }).success, false);
	});

	it('prevents clearing every agency while allowing partial updates', () => {
		assert.equal(UpdateHolidaySchema.safeParse({ agency_ids: [] }).success, false);
		assert.equal(UpdateHolidaySchema.safeParse({ title: 'Edited holiday' }).success, true);
	});

	it('still requires a creator on the stored holiday', () => {
		const holiday = {
			_id: 'holiday',
			agency_ids: ['agency'],
			created_at: 1_792_368_000_000,
			title: '25 de Abril',
			updated_at: 1_792_368_000_000,
		};
		assert.equal(HolidaySchema.safeParse(holiday).success, false);
		assert.equal(HolidaySchema.safeParse({ ...holiday, created_by: 'user' }).success, true);
	});
});
