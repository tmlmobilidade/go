/* * */

import { type Path, type StopsParameter } from '@tmlmobilidade/types';

/* * */

export type MergedPathItem = Path & {
	avg_speed?: null | number // km/h
	dwell_time?: null | number // seconds
};

export interface SegmentTravelTimes {
	legSeconds: { formatted: Array<string>, raw: Array<null | number> }
	segmentTravelSeconds: { formatted: Array<string>, raw: Array<null | number> }
	stopDwellSeconds: { formatted: Array<string>, raw: Array<null | number> }
	totalTripSecondsWithoutStops: { formatted: string, raw: number }
	totalTripSecondsWithStops: { formatted: string, raw: number }
}

/* * */

export function toNumberOrNull(value: unknown): null | number {
	if (value === null || value === undefined) return null;
	if (typeof value === 'number') return Number.isFinite(value) ? value : null;
	if (typeof value === 'string') {
		const v = Number(value.replace(',', '.'));
		return Number.isFinite(v) ? v : null;
	}
	return null;
}

export function computeSegmentSeconds(
	distanceMeters: null | number,
	speedKmh: null | number,
): null | number {
	if (distanceMeters === null || distanceMeters <= 0) return null;
	if (speedKmh === null || speedKmh <= 0) return null;

	const speedMs = speedKmh * 1000 / 3600;
	return Math.round(distanceMeters / speedMs);
}

export function formatSecondsToTime(timeInSeconds: null | number): string {
	if (timeInSeconds === null || timeInSeconds === undefined) return '•••';

	if (timeInSeconds < 60) {
		return timeInSeconds + ' seg';
	}
	if (timeInSeconds < 3600) {
		const minutes = Math.floor(timeInSeconds / 60);
		const seconds = timeInSeconds % 60;
		return `${minutes} min ${seconds} seg`;
	}
	const hours = Math.floor(timeInSeconds / 3600);
	const minutes = Math.floor((timeInSeconds % 3600) / 60);
	const seconds = timeInSeconds % 60;
	return `${hours} h ${minutes} min ${seconds} seg`;
}

export function computeSegmentTravelTimes(mergedPath: MergedPathItem[]): SegmentTravelTimes {
	const segmentTravelSeconds: Array<null | number> = [];
	const stopDwellSeconds: Array<null | number> = [];
	const legSeconds: Array<null | number> = [];

	for (let i = 0; i < mergedPath.length; i++) {
		const row = mergedPath[i];

		const dwell = toNumberOrNull(row.dwell_time);
		stopDwellSeconds.push(dwell !== null && dwell > 0 ? Math.round(dwell) : 0);

		if (i === 0) {
			segmentTravelSeconds.push(null);
			continue;
		}

		const distanceMeters = toNumberOrNull(row.distance_delta);
		const speedKmh = toNumberOrNull(row.avg_speed);

		segmentTravelSeconds.push(computeSegmentSeconds(distanceMeters, speedKmh));
	}

	for (let i = 0; i < mergedPath.length; i++) {
		const nextTravelSeconds = segmentTravelSeconds[i + 1];

		if (nextTravelSeconds === undefined || nextTravelSeconds === null) {
			legSeconds.push(stopDwellSeconds[i] ?? 0);
			continue;
		}

		legSeconds.push((stopDwellSeconds[i] ?? 0) + nextTravelSeconds);
	}

	const totalTripSecondsWithoutStops = segmentTravelSeconds
		.filter((v): v is number => typeof v === 'number')
		.reduce((a, b) => a + b, 0);

	const totalStopSeconds = stopDwellSeconds
		.filter((v): v is number => typeof v === 'number')
		.reduce((a, b) => a + b, 0);

	const totalTripSecondsWithStops = totalTripSecondsWithoutStops + totalStopSeconds;

	return {
		legSeconds: {
			formatted: legSeconds.map(s => formatSecondsToTime(s)),
			raw: legSeconds,
		},
		segmentTravelSeconds: {
			formatted: segmentTravelSeconds.map(s => formatSecondsToTime(s)),
			raw: segmentTravelSeconds,
		},
		stopDwellSeconds: {
			formatted: stopDwellSeconds.map(s => formatSecondsToTime(s)),
			raw: stopDwellSeconds,
		},
		totalTripSecondsWithoutStops: {
			formatted: formatSecondsToTime(totalTripSecondsWithoutStops),
			raw: totalTripSecondsWithoutStops,
		},
		totalTripSecondsWithStops: {
			formatted: formatSecondsToTime(totalTripSecondsWithStops),
			raw: totalTripSecondsWithStops,
		},
	};
}

export function getMergedPath(basePath: Path[], newPath: StopsParameter['path']): MergedPathItem[] {
	return basePath.map((baseItem, i) => {
		const edit = (newPath || [])[i];
		return {
			...baseItem,
			avg_speed: edit?.avg_speed,
			dwell_time: edit?.dwell_time,
		};
	});
}
