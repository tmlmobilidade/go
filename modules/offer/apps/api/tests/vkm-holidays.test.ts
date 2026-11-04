import assert from 'node:assert/strict';
import { mock, test } from 'node:test';

/* * */

const holidayQueries: unknown[] = [];
mock.module('@tmlmobilidade/go-interfaces-godb', {
	namedExports: {
		goDb: {
			core: { agencies: { findById: async () => ({ _id: 'A', financials: { price_per_km: 1, vkm_per_month: Array(12).fill(0) }, name: 'Agency' }) } },
			dates: { holidays: { findMany: async (query: unknown) => {
				holidayQueries.push(query);
				return [{ _id: 'holiday', agency_ids: ['A'], dates: ['20261022'], title: 'Holiday' }];
			} } },
			offer: {
				events: { findMany: async () => [] },
				lines: { findMany: async () => [] },
				yearPeriods: { findMany: async () => [] },
			},
		},
	},
});

const { VkmController } = await import('../src/endpoints/vkm/vkm.controller.js');

/* * */

test('VKM reads agency holidays from Dates and retains Offer event/period sources', async () => {
	const request = {
		body: { agency_id: 'A', calculation_method: 'fixed_range', end_date: '20261022', extension_source: 'go', start_date: '20261022' },
		permissions: [{ action: 'read', resources: { agency_ids: ['A'] }, scope: 'lines' }],
	};
	let sent: unknown;
	const reply = { send: (response: unknown) => {
		sent = response;
	} };
	await VkmController.calculate(request as unknown as Parameters<typeof VkmController.calculate>[0], reply as unknown as Parameters<typeof VkmController.calculate>[1]);
	assert.deepEqual(holidayQueries, [{ agency_ids: { $in: ['A'] } }]);
	assert.ok(sent);
});
