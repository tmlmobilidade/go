/* * */

import { Path, StopsParameter } from '@tmlmobilidade/types';

/* * */

type MergedPathItem = Path & {
	avg_speed?: null | number // km/h
	dwell_time?: null | number // seconds
};

export type StopsParameterExtended = StopsParameter & {
	name: string
	shortName: string
	travelTimes: {
		segmentTravelSeconds: { formatted: Array<string>, raw: Array<null | number> }
		stopDwellSeconds: { formatted: Array<string>, raw: Array<null | number> }
		totalTripSecondsWithoutStops: { formatted: string, raw: number }
		totalTripSecondsWithStops: { formatted: string, raw: number }
	}
};

/* * */

function toNumberOrNull(value: unknown): null | number {
	if (value === null || value === undefined) return null;
	if (typeof value === 'number') return Number.isFinite(value) ? value : null;
	if (typeof value === 'string') {
		const v = Number(value.replace(',', '.'));
		return Number.isFinite(v) ? v : null;
	}
	return null;
}

function computeSegmentSeconds(distanceMeters: null | number, speedKmh: null | number): number {
	if (!distanceMeters || !speedKmh) return 0;

	// km/h -> m/s
	const speedMs = speedKmh * 1000 / 3600;
	return Math.round(distanceMeters / speedMs) || 0;
}

function formatSecondsToTime(timeInSeconds) {
	//
	if (!timeInSeconds && timeInSeconds !== 0) return '•••';

	if (timeInSeconds < 60) {
		return timeInSeconds + ' seg';
	} else if (timeInSeconds < 3600) {
		const minutes = Math.floor(timeInSeconds / 60);
		const seconds = timeInSeconds % 60;
		return `${minutes} min ${seconds} seg`;
	} else {
		const hours = Math.floor(timeInSeconds / 3600);
		const minutes = Math.floor((timeInSeconds % 3600) / 60);
		const seconds = timeInSeconds % 60;
		return `${hours} h ${minutes} min ${seconds} seg`;
	}
}

/* * */

export function computeSegmentTravelTimes(mergedPath: MergedPathItem[]) {
	const segmentTravelSeconds: Array<null | number> = [];
	const stopDwellSeconds: Array<null | number> = [];

	for (let i = 0; i < mergedPath.length; i++) {
		const row = mergedPath[i];

		// Dwell applies at the stop itself (your call: include first stop dwell or not)
		const dwell = toNumberOrNull(row.dwell_time);
		stopDwellSeconds.push(dwell && dwell > 0 ? Math.round(dwell) : null);

		// Segment travel time applies from previous stop -> current stop
		if (i === 0) {
			segmentTravelSeconds.push(null);
			continue;
		}

		const distanceMeters = toNumberOrNull(row.distance_delta);
		const speedKmh = toNumberOrNull(row.avg_speed);

		segmentTravelSeconds.push(computeSegmentSeconds(distanceMeters, speedKmh));
	}

	const totalTripSecondsWithoutStops = segmentTravelSeconds
		.filter((v): v is number => typeof v === 'number')
		.reduce((a, b) => a + b, 0);

	const totalStopSeconds = stopDwellSeconds
		.filter((v): v is number => typeof v === 'number')
		.reduce((a, b) => a + b, 0);

	const totalTripSecondsWithStops = totalTripSecondsWithoutStops + totalStopSeconds;

	return {
		segmentTravelSeconds: { formatted: segmentTravelSeconds.map(s => formatSecondsToTime(s)), raw: segmentTravelSeconds },
		stopDwellSeconds: { formatted: stopDwellSeconds.map(s => formatSecondsToTime(s)), raw: stopDwellSeconds },
		totalTripSecondsWithoutStops: { formatted: formatSecondsToTime(totalTripSecondsWithoutStops), raw: totalTripSecondsWithoutStops },
		totalTripSecondsWithStops: { formatted: formatSecondsToTime(totalTripSecondsWithStops), raw: totalTripSecondsWithStops },
	};
}

export function getMergedPath(basePath: Path[], newPath: StopsParameter['path']): MergedPathItem[] {
	// If you always keep form.values.path aligned with base, this is simple.
	// We match by stop_id as a stable key.
	const editedByStopId = new Map<string, any>(
		(newPath || [])
			.filter(p => p?.stop_id)
			.map(p => [p.stop_id as string, p]),
	);

	return basePath.map((baseItem) => {
		const edit = editedByStopId.get(baseItem.stop_id);
		return {
			...baseItem,
			avg_speed: edit?.avg_speed,
			dwell_time: edit?.dwell_time,
		};
	});
}
