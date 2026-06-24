'use client';

import { useStopDetailContext } from '@/components/stops/detail/StopDetail.context';
import { audioTtsUrl } from '@/settings/urls.settings';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { Button } from '@tmlmobilidade/ui';
import { useEffect, useState } from 'react';

import styles from './styles.module.css';

/* * */

export interface StopDetailPlayTTSProps {
	active?: boolean
}

export function StopDetailPlayTTS({ active = true }: StopDetailPlayTTSProps) {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();
	const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [progress, setProgress] = useState(0);
	const stopId = stopDetailContext.data.stop?._id;
	const ttsAudioVersion = stopDetailContext.flags.ttsAudioVersion;

	useEffect(() => {
		setAudio((current) => {
			current?.pause();
			return null;
		});
		setIsPlaying(false);
		setProgress(0);
	}, [ttsAudioVersion]);

	//
	// B. Handle actions

	const handleTTSAudio = async () => {
		if (!stopId || !active) return;

		if (isPlaying && audio) {
			audio.pause();
			setIsPlaying(false);
			return;
		}

		const audioToPlay = audio ?? new Audio();

		audioToPlay.src = `${audioTtsUrl}/${stopId}.mp3?v=${ttsAudioVersion}`;

		if (!audio) {
			audioToPlay.ontimeupdate = () => {
				if (!audioToPlay.duration) return;
				setProgress((audioToPlay.currentTime / audioToPlay.duration) * 100);
			};

			audioToPlay.onended = () => {
				setIsPlaying(false);
				setProgress(0);
			};

			setAudio(audioToPlay);
		}

		await audioToPlay.play().catch(() => {
			setIsPlaying(false);
			setProgress(0);
			return;
		});

		setIsPlaying(true);
	};

	//
	//  C. Render components

	return (
		<Button
			className={isPlaying ? styles.buttonPlaying : undefined}
			disabled={!active}
			label="Reproduzir TTS"
			onClick={handleTTSAudio}
			style={{ '--progress': `${progress}%` } as React.CSSProperties}
			rightSection={
				isPlaying ? <IconPlayerPause size={16} /> : <IconPlayerPlay size={16} />
			}
		/>
	);
}
