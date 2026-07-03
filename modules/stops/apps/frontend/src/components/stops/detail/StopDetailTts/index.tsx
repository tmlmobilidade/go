'use client';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type File } from '@tmlmobilidade/types';
import { Button } from '@tmlmobilidade/ui';
import { useEffect, useRef, useState } from 'react';
import useSWR from 'swr';

/* * */

interface StopTtsResponse {
	file: File | null
}

/* * */

export function StopDetailTts() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const stopId = stopDetailContext.data.stop?._id;

	const { data: stopTtsData, error: stopTtsError, isLoading: stopTtsLoading } = useSWR<StopTtsResponse, Error>(API_ROUTES.stops.STOPS_TTS(String(`tts-${stopId}`)));

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

	const handleTTSAudio = async () => {
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

	if (!stopId) return null;

	return (
		<Button
			disabled={stopTtsLoading || !!stopTtsError || !audioUrl}
			label="Reproduzir TTS"
			loading={stopTtsLoading}
			onClick={handleTTSAudio}
			rightSection={
				isPlaying ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />
			}
		/>
	);

	//
}
