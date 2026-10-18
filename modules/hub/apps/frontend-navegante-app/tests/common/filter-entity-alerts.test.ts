import { filterAlertsForLine, filterAlertsForStop } from '@/utils/transit/filter-entity-alerts';
import { type HubV1ApiAlert } from '@tmlmobilidade/go-types-hub';
import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

/* * */

const line = { _id: '[41]1523', agency_id: '41' };
const stopOnLine = { _id: 'stop-1', agency_ids: ['41'], line_ids: ['[41]1523'] };
const otherStopOnLine = { _id: 'stop-2', agency_ids: ['41'], line_ids: ['[41]1523'] };
const stopIdsOnLine = new Set(['stop-1', 'stop-2']);

function alert(partial: Pick<HubV1ApiAlert, 'agency_id' | 'reference_type' | 'references'>) {
	return partial;
}

/* * */

describe('filter entity alerts', () => {
	it('shows an agency alert on that agency’s stops and lines', () => {
		const agencyAlert = alert({
			agency_id: '41',
			reference_type: 'agency',
			references: [{ child_ids: [], parent_id: '41' }],
		});

		assert.deepEqual(filterAlertsForStop([agencyAlert], stopOnLine), [agencyAlert]);
		assert.deepEqual(filterAlertsForLine([agencyAlert], line, stopIdsOnLine), [agencyAlert]);
		assert.deepEqual(filterAlertsForStop([agencyAlert], { ...stopOnLine, agency_ids: ['42'] }), []);
		assert.deepEqual(filterAlertsForLine([agencyAlert], { ...line, agency_id: '42' }, stopIdsOnLine), []);
	});

	it('shows a whole-line alert on the line and on every stop of that line', () => {
		const lineAlert = alert({
			agency_id: '41',
			reference_type: 'lines',
			references: [{ child_ids: [], parent_id: '[41]1523' }],
		});

		assert.deepEqual(filterAlertsForLine([lineAlert], line, stopIdsOnLine), [lineAlert]);
		assert.deepEqual(filterAlertsForStop([lineAlert], stopOnLine), [lineAlert]);
		assert.deepEqual(filterAlertsForStop([lineAlert], { ...stopOnLine, line_ids: ['[42]999'] }), []);
	});

	it('limits a line alert to the listed stops, and still shows it on the line', () => {
		const lineAlert = alert({
			agency_id: '41',
			reference_type: 'lines',
			references: [{ child_ids: ['stop-1'], parent_id: '[41]1523' }],
		});

		assert.deepEqual(filterAlertsForStop([lineAlert], stopOnLine), [lineAlert]);
		assert.deepEqual(filterAlertsForStop([lineAlert], otherStopOnLine), []);
		assert.deepEqual(filterAlertsForLine([lineAlert], line, stopIdsOnLine), [lineAlert]);
	});

	it('shows a whole-stop alert on the stop and on lines that serve it', () => {
		const stopAlert = alert({
			agency_id: '41',
			reference_type: 'stops',
			references: [{ child_ids: [], parent_id: 'stop-1' }],
		});

		assert.deepEqual(filterAlertsForStop([stopAlert], stopOnLine), [stopAlert]);
		assert.deepEqual(filterAlertsForStop([stopAlert], otherStopOnLine), []);
		assert.deepEqual(filterAlertsForLine([stopAlert], line, stopIdsOnLine), [stopAlert]);
		assert.deepEqual(filterAlertsForLine([stopAlert], line, new Set(['stop-2'])), []);
	});

	it('limits a stop alert to the listed lines', () => {
		const stopAlert = alert({
			agency_id: '41',
			reference_type: 'stops',
			references: [{ child_ids: ['[41]1523'], parent_id: 'stop-1' }],
		});

		assert.deepEqual(filterAlertsForStop([stopAlert], stopOnLine), [stopAlert]);
		assert.deepEqual(filterAlertsForLine([stopAlert], line, stopIdsOnLine), [stopAlert]);
		assert.deepEqual(filterAlertsForLine([stopAlert], { ...line, _id: '[41]9999' }, stopIdsOnLine), []);
	});

	it('leaves ride alerts off stop and line details', () => {
		const rideAlert = alert({
			agency_id: '41',
			reference_type: 'rides',
			references: [{ child_ids: [], parent_id: '[plan][41]trip' }],
		});

		assert.deepEqual(filterAlertsForStop([rideAlert], stopOnLine), []);
		assert.deepEqual(filterAlertsForLine([rideAlert], line, stopIdsOnLine), []);
	});
});
