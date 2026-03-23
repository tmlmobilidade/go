'use client';

/* * */

import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from '@tabler/icons-react';
import { Button, Section, Slider } from '@tmlmobilidade/ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/* * */

const PLAY_INTERVAL_MS = 1000;

/* * */

export function ReplayEvents() {
	//

	//
	// A. Setup variables

	const rideAnalysisContext = useRideAnalysisContext();

	const sortedVehicleEvents = useMemo(
		() => [...rideAnalysisContext.data.vehicle_events].sort((a, b) => a.created_at - b.created_at),
		[rideAnalysisContext.data.vehicle_events],
	);

	const eventCount = sortedVehicleEvents.length;
	const maxIndex = eventCount - 1;

	const [index, setIndex] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);
	const playIntervalRef = useRef<null | ReturnType<typeof setInterval>>(null);

	const stopPlayback = useCallback(() => {
		if (playIntervalRef.current !== null) {
			clearInterval(playIntervalRef.current);
			playIntervalRef.current = null;
		}
		setIsPlaying(false);
	}, []);

	//
	// B. Effects

	useEffect(() => {
		setIndex(i => Math.min(i, Math.max(0, eventCount - 1)));
	}, [eventCount]);

	useEffect(() => {
		return () => {
			if (playIntervalRef.current !== null) {
				clearInterval(playIntervalRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (!isPlaying || maxIndex < 0) return;
		playIntervalRef.current = setInterval(() => {
			setIndex((i) => {
				if (i >= maxIndex) {
					stopPlayback();
					return i;
				}
				return i + 1;
			});
		}, PLAY_INTERVAL_MS);
		return () => {
			if (playIntervalRef.current !== null) {
				clearInterval(playIntervalRef.current);
				playIntervalRef.current = null;
			}
		};
	}, [isPlaying, maxIndex, stopPlayback]);

	//
	// C. Render guards

	if (rideAnalysisContext.data.ride?.operational_status !== 'ended') return;

	if (eventCount === 0) return;

	//
	// D. Handlers

	const togglePlay = () => {
		if (isPlaying) {
			stopPlayback();
			return;
		}
		if (index >= maxIndex) {
			setIndex(0);
		}
		setIsPlaying(true);
	};

	const onSliderChange = (value: number) => {
		setIndex(value);
	};

	//
	// E. Render components

	return (
		<Section alignItems="center" flexDirection="row" gap="md">
			<Button
				icon={isPlaying ? <IconPlayerPauseFilled /> : <IconPlayerPlayFilled />}
				onClick={togglePlay}
			/>
			<Slider
				max={maxIndex}
				min={1}
				onChange={onSliderChange}
				step={1}
				value={index}
			/>
		</Section>
	);

	//
}
