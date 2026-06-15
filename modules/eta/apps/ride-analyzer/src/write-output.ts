/* * */

import type { CliArgs, ReplaySnapshot, RouteNode, StopWaypoint, TripContext } from '@/types.js';

import { Logger } from '@tmlmobilidade/logger';
import { CsvWriter } from '@tmlmobilidade/writers';
import fs from 'node:fs';
import path from 'node:path';

/* * */

interface RunMetadata {
	args: CliArgs
	completedAt: string
	eventCount: number
	snapshotCount: number
	startedAt: string
	tripContext: TripContext
}

interface FlatEtaRow {
	estimated_arrival: null | string
	estimated_arrival_unix: null | number
	eta_seconds: null | number
	event_created_at: number
	event_id: string
	event_index: number
	node_index: null | number
	observed_arrival: null | string
	observed_arrival_unix: null | number
	scheduled_arrival: null | string
	scheduled_arrival_unix: null | number
	stop_id: string
	stop_node_index: number
	stop_sequence: number
	trip_id: string
	vehicle_id: string
}

interface WriteOutputArgs {
	metadata: RunMetadata
	route: RouteNode[]
	snapshots: ReplaySnapshot[]
	stops: StopWaypoint[]
}

function ensureDir(dir: string) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function flattenSnapshots(snapshots: ReplaySnapshot[]): FlatEtaRow[] {
	const rows: FlatEtaRow[] = [];
	for (const snapshot of snapshots) {
		for (const eta of snapshot.etas) {
			rows.push({
				estimated_arrival: eta.estimated_arrival,
				estimated_arrival_unix: eta.estimated_arrival_unix,
				eta_seconds: eta.eta_seconds,
				event_created_at: snapshot.event.created_at,
				event_id: snapshot.event._id,
				event_index: snapshot.event_index,
				node_index: snapshot.curr_vehicle_event?.node_index ?? null,
				observed_arrival: eta.observed_arrival,
				observed_arrival_unix: eta.observed_arrival_unix,
				scheduled_arrival: eta.scheduled_arrival,
				scheduled_arrival_unix: eta.scheduled_arrival_unix,
				stop_id: eta.stop_id,
				stop_node_index: eta.stop_node_index,
				stop_sequence: eta.stop_sequence,
				trip_id: eta.trip_id,
				vehicle_id: eta.vehicle_id,
			});
		}
	}
	return rows;
}

/**
 * Persists the analyzer run output to disk:
 *  - `summary.json`  — full per-event snapshots + run metadata.
 *  - `route.json`    — ordered shape-node polyline for the trip.
 *  - `stops.json`    — snapped stop waypoints for the trip.
 *  - `etas.csv`      — flat (event × stop) table convenient for spreadsheets.
 *
 * Also logs the open-ready URL of the static viewer at
 * `modules/eta/docs/ride-analyzer.html?run=<run-id>`.
 */
export async function writeOutput({ metadata, route, snapshots, stops }: WriteOutputArgs) {
	const outputDir = metadata.args.outputDir;
	ensureDir(outputDir);

	const summaryPath = path.join(outputDir, 'summary.json');
	const routePath = path.join(outputDir, 'route.json');
	const stopsPath = path.join(outputDir, 'stops.json');
	const csvPath = path.join(outputDir, 'etas.csv');

	const summary = {
		metadata,
		snapshots,
	};
	fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), { encoding: 'utf-8' });
	Logger.info(`Wrote ${summaryPath}`);

	fs.writeFileSync(routePath, JSON.stringify(route), { encoding: 'utf-8' });
	Logger.info(`Wrote ${routePath} (${route.length} nodes)`);

	fs.writeFileSync(stopsPath, JSON.stringify(stops, null, 2), { encoding: 'utf-8' });
	Logger.info(`Wrote ${stopsPath} (${stops.length} stops)`);

	const flatRows = flattenSnapshots(snapshots);
	const csvWriter = new CsvWriter<FlatEtaRow>('ride-analyzer', csvPath, { batch_size: 100000, logs: false });
	if (flatRows.length > 0) {
		await csvWriter.write(flatRows);
		await csvWriter.flush();
	}
	Logger.info(`Wrote ${csvPath} (${flatRows.length} rows)`);

	const runId = path.basename(outputDir);
	Logger.success(
		`Open the viewer at: modules/eta/docs/ride-analyzer.html?run=${runId}\n`
		+ `  (serve from repo root, e.g. \`python3 -m http.server 8080 --directory modules/eta\`,\n`
		+ `   then http://localhost:8080/docs/ride-analyzer.html?run=${runId})`,
	);
}
