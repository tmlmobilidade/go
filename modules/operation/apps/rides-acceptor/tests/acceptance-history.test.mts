import { type RideAcceptance, RideAcceptanceSchema } from '@tmlmobilidade/go-types-operation';
import assert from 'node:assert/strict';
import { mock, test } from 'node:test';
import { isDeepStrictEqual } from 'node:util';

import { type RideWithAnalyses } from '../src/types/ride-with-analyses.js';

type Comment = RideAcceptance['comments'][number];
let acceptance: RideAcceptance;
let alertLookups = 0;

function applyUpdate(filter: Partial<RideAcceptance>, update: { $push: { comments: { $each: Comment[] } }, $set: Partial<RideAcceptance> }) {
	if (!Object.entries(filter).every(([key, value]) => isDeepStrictEqual(acceptance[key as keyof RideAcceptance], value))) return null;
	assert.equal(Object.hasOwn(update.$set, 'comments'), false);
	acceptance = RideAcceptanceSchema.parse({ ...acceptance, ...update.$set, comments: [...acceptance.comments, ...update.$push.comments.$each] });
	return acceptance;
}

mock.module('@tmlmobilidade/go-interfaces-godb', {
	namedExports: {
		goDb: {
			operation: {
				alerts: {
					findOne: async () => {
						alertLookups++;
						return { _id: 'alert-1', cause: 'WEATHER', created_by: 'operator', description: 'Road closed due to flooding.' };
					},
				},
				rideAcceptances: {
					getCollection: async () => ({
						findOneAndUpdate: async (...args: Parameters<typeof applyUpdate>) => applyUpdate(...args),
						updateOne: async (...args: Parameters<typeof applyUpdate>) => ({ modifiedCount: applyUpdate(...args) ? 1 : 0 }),
					}),
					insertOneUnsafe: async (document: RideAcceptance) => { acceptance = document; },
				},
			},
		},
	},
});

const { alertJustification } = await import('../src/alert-justification.js');
const { createRideAcceptance } = await import('../src/create-ride-acceptance.js');
const { updateRideAcceptance } = await import('../src/update-ride-acceptance.js');

test('creation, analysis changes, and the first alert append history in order', async () => {
	const ride: RideWithAnalyses = {
		_id: 'ride-1',
		analysis: { simple_three_vehicle_events: { grade: 'pass', reason: 'ALL_STOPS_FOUND' } },
		operational_status: 'ended',
		route_short_name: '3506',
	};
	await createRideAcceptance(ride);
	const initialEvents = acceptance.comments.slice();
	assert.deepEqual(initialEvents.map(event => event.type === 'crud' ? event.action : event.type === 'field_changed' && event.field), ['create', 'analysis_summary', 'acceptance_status']);
	const originalSummary = acceptance.analysis_summary;
	const failingRide: RideWithAnalyses = { ...ride, analysis: { simple_three_vehicle_events: { grade: 'fail', reason: 'MISSING_MIDDLE_STOPS' } } };
	const updated = await updateRideAcceptance(failingRide, acceptance);
	assert.ok(updated);
	assert.deepEqual(updated.comments.slice(0, -2), initialEvents);
	assert.equal(updated.acceptance_status, 'justification_required');
	assert.deepEqual(updated.comments.at(-2), {
		created_at: updated.updated_at,
		created_by: 'system',
		curr_value: updated.analysis_summary,
		field: 'analysis_summary',
		prev_value: originalSummary,
		type: 'field_changed',
		updated_at: updated.updated_at,
		updated_by: 'system',
	});
	await alertJustification(failingRide, updated);
	assert.equal(acceptance.acceptance_status, 'under_review');
	assert.deepEqual(acceptance.comments.slice(0, -2), updated.comments);
	const justificationEvent = acceptance.comments.at(-2);
	const statusEvent = acceptance.comments.at(-1);
	assert.ok(justificationEvent?.type === 'field_changed' && statusEvent?.type === 'field_changed');
	assert.equal(justificationEvent.field, 'justification');
	assert.deepEqual(justificationEvent.curr_value, acceptance.justification);
	assert.equal(acceptance.justification?.alert_id, 'alert-1');
	assert.equal(statusEvent.prev_value, 'justification_required');
	assert.equal(statusEvent.curr_value, 'under_review');
	await alertJustification(failingRide, acceptance);
	assert.equal(alertLookups, 1);
});
