'use client';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { audioTtsUrl } from '@/settings/urls.settings';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { Button } from '@tmlmobilidade/ui';
import { useRef, useState } from 'react';

import styles from './styles.module.css';

/* * */

export function StopDetailPlayTTS() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [isPlaying] = useState<boolean>(false);
	const [progress, setProgress] = useState<number>(0);
	const stopId = stopDetailContext.data.stop?._id;

	//
	// B. Handle actions

	const handleTTSAudio = async () => {
		if (!stopId) return;

		const audioToPlay = new Audio(`${audioTtsUrl}/${stopId}.mp3`);

		audioToPlay.ontimeupdate = () => {
			if (!audioToPlay.duration) return;
			setProgress((audioToPlay.currentTime / audioToPlay.duration) * 100);
		};

		audioRef.current = audioToPlay;
	};

	//
	//  C. Render components

	return (
		<Button
			className={isPlaying ? styles.buttonPlaying : undefined}
			label="Reproduzir TTS"
			onClick={handleTTSAudio}
			style={{ '--progress': `${progress}%` } as React.CSSProperties}
			rightSection={
				isPlaying ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />
			}
		/>
	);
}
