'use client';

import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { IconPlayerPauseFilled, IconPlayerPlayFilled } from '@tabler/icons-react';
import { Button, Section, Slider } from '@tmlmobilidade/ui';
import { useCallback, useEffect, useRef, useState } from 'react';

/* * */

const PLAY_INTERVAL_MS = 1000;

/* * */

interface ReplayEventsProps {
	onReplayIndexChange: (index: number) => void
	replayIndex: number
}

/* * */

export function ReplayEvents({ onReplayIndexChange, replayIndex }: ReplayEventsProps) {
	//

	//
	// A. Setup variables

	const rideAnalysisContext = useRideAnalysisContext();

	const eventCount = rideAnalysisContext.geojson.observed_events.features.length;
	const maxIndex = eventCount - 1;

	const [isPlaying, setIsPlaying] = useState(false);
	const playIntervalRef = useRef<null | ReturnType<typeof setInterval>>(null);
	const replayIndexRef = useRef(replayIndex);

	useEffect(() => {
		replayIndexRef.current = replayIndex;
	}, [replayIndex]);

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
		return () => {
			if (playIntervalRef.current !== null) {
				clearInterval(playIntervalRef.current);
			}
		};
	}, []);

	useEffect(() => {
		if (!isPlaying || maxIndex < 0) return;
		playIntervalRef.current = setInterval(() => {
			const i = replayIndexRef.current;
			if (i >= maxIndex) {
				stopPlayback();
				return;
			}
			onReplayIndexChange(i + 1);
		}, PLAY_INTERVAL_MS);
		return () => {
			if (playIntervalRef.current !== null) {
				clearInterval(playIntervalRef.current);
				playIntervalRef.current = null;
			}
		};
	}, [isPlaying, maxIndex, onReplayIndexChange, stopPlayback]);

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

		if (replayIndex >= maxIndex) {
			onReplayIndexChange(0);
		}

		setIsPlaying(true);
	};

	const onSliderChange = (value: number) => {
		stopPlayback();
		onReplayIndexChange(value);
	};

	//
	// E. Render components

	return (
		<Section alignItems="center" flexDirection="row" gap="md">
			<Button
				icon={isPlaying ? <IconPlayerPauseFilled /> : <IconPlayerPlayFilled />}
				label={isPlaying ? 'Pause' : 'Play'}
				onClick={togglePlay}
				styles={{
					label: { minWidth: '55px', textAlign: 'center' },
				}}
			/>
			<Slider
				max={maxIndex}
				min={0}
				onChange={onSliderChange}
				step={1}
				value={replayIndex}
			/>
		</Section>
	);

	//
}
