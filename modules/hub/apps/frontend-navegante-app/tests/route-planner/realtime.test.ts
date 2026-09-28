import { getRoutePlannerLegRealtimeStatus } from '@/utils/route-planner/itinerary/realtime';
import { type MotisPlanLeg } from '@tmlmobilidade/go-types-motis';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

describe('route-planner boarding time deviations', () => {
	it('uses the two-minute early departure even when arrival is sixteen minutes early', () => {
		const status = getRoutePlannerLegRealtimeStatus(createLeg());

		assert.equal(status.departure_delay_seconds, -120);
		assert.equal(status.to_time.effective_time, '2026-09-28T12:29:00Z');
		assert.equal(status.to_time.planned_time, '2026-09-28T12:45:00Z');
	});

	it('does not warn about boarding when only arrival changes', () => {
		const status = getRoutePlannerLegRealtimeStatus(createLeg({ startTime: '2026-09-28T12:03:00Z' }));

		assert.equal(status.departure_delay_seconds, 0);
	});

	it('keeps a late departure distinct from an early arrival', () => {
		const status = getRoutePlannerLegRealtimeStatus(createLeg({ startTime: '2026-09-28T12:05:00Z' }));

		assert.equal(status.departure_delay_seconds, 120);
	});

	it('does not treat scheduled-only data as a realtime departure warning', () => {
		assert.equal(getRoutePlannerLegRealtimeStatus(createLeg({ realTime: false })).departure_delay_seconds, 0);
	});

	it('does not invent a departure warning without a valid scheduled departure', () => {
		assert.equal(getRoutePlannerLegRealtimeStatus(createLeg({ scheduledStartTime: undefined })).departure_delay_seconds, 0);
		assert.equal(getRoutePlannerLegRealtimeStatus(createLeg({ scheduledStartTime: 'invalid' })).departure_delay_seconds, 0);
	});
});

/* * */

function createLeg(overrides: Partial<MotisPlanLeg> = {}): MotisPlanLeg {
	return {
		duration: 1_680,
		endTime: '2026-09-28T12:29:00Z',
		from: { lat: 38.8, lon: -9.1, name: 'Pç República (Est serviço)' },
		legGeometry: { length: 0, points: '', precision: 5 },
		mode: 'BUS',
		realTime: true,
		scheduled: true,
		scheduledEndTime: '2026-09-28T12:45:00Z',
		scheduledStartTime: '2026-09-28T12:03:00Z',
		startTime: '2026-09-28T12:01:00Z',
		to: { lat: 38.9, lon: -9.0, name: 'Alverca (Estação)' },
		...overrides,
	};
}
