'use client';

import { useEffect, useRef, useState } from 'react';

/* * */

/** Stops extrapolating if fresh samples stop arriving, so a stalled fetch can't drift the number. */
const MAX_EXTRAPOLATION_MS = 60_000;

export interface TickingCountSample {
	count: number
	from: number
	to: number
}

/* * */

/**
 * Ticks the count every 3 seconds between samples, using the rate of change of the last two samples.
 * Until a second sample arrives, it uses the first sample's average rate over its window (lower than daytime peaks).
 * The value is an estimate between fetches and snaps back to the real count on every new sample.
 */
export function useTickingCount(sample?: TickingCountSample) {
	const [estimate, setEstimate] = useState<number>();
	const anchor = useRef<TickingCountSample & { rate: number, receivedAt: number } | undefined>(undefined);

	useEffect(() => {
		if (!sample || sample.to === anchor.current?.to) return;
		const previous = anchor.current;
		const rate = previous && sample.to > previous.to
			? (sample.count - previous.count) / (sample.to - previous.to)
			: sample.count / Math.max(sample.to - sample.from, 1);
		anchor.current = { ...sample, rate, receivedAt: Date.now() };
		setEstimate(sample.count);
	}, [sample]);

	useEffect(() => {
		const interval = setInterval(() => {
			if (!anchor.current) return;
			const elapsed = Math.min(Date.now() - anchor.current.receivedAt, MAX_EXTRAPOLATION_MS);
			setEstimate(Math.round(anchor.current.count + anchor.current.rate * elapsed));
		}, 3_000);
		return () => clearInterval(interval);
	}, []);

	return estimate;
}
