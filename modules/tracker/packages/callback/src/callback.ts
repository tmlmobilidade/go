/* * */

import { Dates } from '@tmlmobilidade/dates';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

// Preserve the branded UnixTimestamp of std_window without pulling in a new
// dependency on @tmlmobilidade/types.
type StdWindow = ReturnType<typeof Dates.fromUnixTimestamp>['std_window'];

/**
 * Callback function to set Rides as 'waiting' based on new SimplifiedVehicleEvent data.
 * This function identifies all Rides that are affected by the new data and marks them as 'waiting',
 * which will trigger the necessary reprocessing in the system.
 * @param data An array of SimplifiedVehicleEvent documents that have been inserted or updated.
 */
export async function setRidesAsWaiting(data: SimplifiedVehicleEvent[]) {
	try {
		//

		// console.log('Callback disabled.');
		// return;

		const timer = new Timer();

		//
		// Skip if there's no data to process

		if (!data || data.length === 0) return;

		//
		// Build out the query to find all Rides
		// that are affected by the new data.

		const updateRidesOps = data
			// Filter out documents that don't have a trip_id,
			// as they can't be associated with a Ride.
			.filter(item => !!item.trip_id)
			// Map each document to a query that will match
			// Rides that are affected by the new data.
			.map((item: SimplifiedVehicleEvent) => {
				const standardWindowInterval = Dates
					.fromUnixTimestamp(item.created_at)
					.std_window;
				return {
					agency_id: item.agency_id,
					start_time_scheduled: {
						$gte: standardWindowInterval.start,
						$lte: standardWindowInterval.end,
					},
					trip_id: item.trip_id,
				};
			});

		//
		// Skip if there are no valid queries to run

		if (!updateRidesOps.length) return;

		//
		// Run the update query to mark all affected Rides as 'waiting',
		// which will trigger the necessary reprocessing in the system.

		const updateRidesResult = await goDb.operation.rides.updateMany(
			{ $or: updateRidesOps },
			{ system_status: 'waiting' },
			{ returnResults: false },
		);

		Logger.info({ message: `Marked as 'waiting': ${updateRidesResult.modifiedCount} Rides (${timer.get()})` });

		//
	} catch (error) {
		Logger.error({ error, message: `Error in setRidesAsWaiting: ${error?.message ?? 'Unknown error'}` });
	}
};

/* * */

/**
 * Decoupled, deduped rides-waiting notifier.
 *
 * `setRidesAsWaiting` is expensive: it builds one `$or` clause per event and
 * awaits a `rides.updateMany`. Running it inside every BatchWriter flush gates
 * the ClickHouse insert path. This notifier moves that work off the hot path:
 * events are collected as distinct `(agency_id, trip_id, std_window)` tuples
 * and flushed on its own timer, so many events collapse to a handful of query
 * clauses and the insert path never waits on rides bookkeeping.
 *
 * ponytail: single shared instance per process, in-flight guard, no queue.
 */
export class RidesWaitingNotifier {
	private flushInProgress: null | Promise<void> = null;
	private pending = new Map<string, { agency_id: string, end: StdWindow['end'], start: StdWindow['start'], trip_id: string }>();
	private timer: NodeJS.Timeout | null = null;

	constructor(private readonly intervalMs: number = 10_000) {}

	/** Buffer a flushed batch of events. Cheap: dedup into a Map, arm the timer. */
	enqueue(data?: SimplifiedVehicleEvent[]) {
		if (!data || data.length === 0) return;
		for (const item of data) {
			if (!item.trip_id) continue;
			const std = Dates.fromUnixTimestamp(item.created_at).std_window;
			// Dedup key: identical clauses collapse to one.
			const key = `${item.agency_id}|${item.trip_id}|${std.start}|${std.end}`;
			if (!this.pending.has(key)) {
				this.pending.set(key, { agency_id: item.agency_id, end: std.end, start: std.start, trip_id: item.trip_id });
			}
		}
		if (!this.timer && this.pending.size > 0) {
			this.timer = setTimeout(() => {
				void this.flush();
			}, this.intervalMs);
		}
	}

	/** Flush pending rides updates. Serialized via in-flight guard. */
	async flush() {
		if (this.flushInProgress) {
			await this.flushInProgress;
			return;
		}
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		if (this.pending.size === 0) return;
		this.flushInProgress = this.runFlush();
		try {
			await this.flushInProgress;
		} finally {
			this.flushInProgress = null;
		}
	}

	private async runFlush() {
		try {
			const timer = new Timer();
			const ops = [...this.pending.values()].map(op => ({
				agency_id: op.agency_id,
				start_time_scheduled: { $gte: op.start, $lte: op.end },
				trip_id: op.trip_id,
			}));
			this.pending.clear();

			if (ops.length === 0) return;

			const updateRidesResult = await goDb.operation.rides.updateMany(
				{ $or: ops },
				{ system_status: 'waiting' },
				{ returnResults: false },
			);

			Logger.info({ message: `Marked as 'waiting': ${updateRidesResult.modifiedCount} Rides from ${ops.length} distinct clauses (${timer.get()})` });
		} catch (error) {
			Logger.error({ error, message: `Error in RidesWaitingNotifier.flush: ${error?.message ?? 'Unknown error'}` });
		}
	}
}
