'use client';

import { IconPlayerPause, IconVolume } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type File } from '@tmlmobilidade/types';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';

import styles from './styles.module.css';

/* * */

interface Props {
	stopId?: string
}

interface StopTtsResponse {
	file: File | null
}

/* * */

export function StopDisplayTts({ stopId }: Props) {
	//

	//
	// A. Setup variables

	const { data: stopTtsData, error: stopTtsError, isLoading: stopTtsLoading } = useSWR<StopTtsResponse, Error>(
		stopId ? { credentials: 'omit', url: API_ROUTES.stops.STOPS_DETAIL_TTS(stopId) } : null,
	);

	const audioUrl = stopTtsData?.file?.url;
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);

	//
	// B. Transform data

	useEffect(() => {
		return () => {
			audioRef.current?.pause();
			audioRef.current = null;
			setIsPlaying(false);
		};
	}, [stopId]);

	//
	// C. Handle actions

	const handleToggleAudio = async () => {
		if (!audioUrl) return;

		if (isPlaying) {
			audioRef.current?.pause();
			return;
		}

		audioRef.current?.pause();

		const audio = new Audio(audioUrl);
		audio.onplaying = () => setIsPlaying(true);
		audio.onpause = () => setIsPlaying(false);
		audio.onended = () => {
			audioRef.current = null;
			setIsPlaying(false);
		};
		audioRef.current = audio;

		try {
			await audio.play();
		} catch {
			audioRef.current = null;
			setIsPlaying(false);
		}
	};

	//
	// D. Render components

	if (!stopId || stopTtsLoading || stopTtsError || !audioUrl) return null;

	return (
		<div className={`${styles.container} ${isPlaying && styles.isPlaying}`} onClick={handleToggleAudio}>
			{isPlaying
				? <IconPlayerPause />
				: <IconVolume />}
		</div>
	);

	//
}
