'use client';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { audioTtsUrl } from '@/settings/urls.settings';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { Button } from '@tmlmobilidade/ui';
import { useRef, useState } from 'react';

/* * */

export function StopDetailPlayTTS() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const stopId = stopDetailContext.data.stop?._id;

	const stopPlayback = () => {
		audioRef.current?.pause();
		audioRef.current = null;
		setIsPlaying(false);
	};

	//
	// B. Handle actions

	const handleTTSAudio = async () => {
		if (!stopId) return;

		if (isPlaying) {
			stopPlayback();
			return;
		}

		stopPlayback();

		const audioToPlay = new Audio(`${audioTtsUrl}/${stopId}.mp3?v=${Date.now()}`);

		audioToPlay.onended = stopPlayback;

		audioRef.current = audioToPlay;

		try {
			await audioToPlay.play();
			setIsPlaying(true);
		} catch {
			stopPlayback();
		}
	};

	//
	//  C. Render components

	return (
		<Button
			label="Reproduzir TTS"
			onClick={handleTTSAudio}
			rightSection={
				isPlaying ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />
			}
		/>
	);
}
