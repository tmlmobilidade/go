'use client';

/* * */

import {
	IconArrowsMaximize,
	IconArrowsMinimize,
	IconPlayerPause,
	IconPlayerPlay,
	IconVolume,
	IconVolumeOff,
} from '@tabler/icons-react';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';

import styles from './styles.module.css';

/* * */

interface VideoPlayerProps {
	poster?: string
	src: string
	title: string
}

/* * */

const formatTime = (value: number) => {
	const safeValue = Number.isFinite(value) ? value : 0;
	const minutes = Math.floor(safeValue / 60);
	const seconds = Math.floor(safeValue % 60);

	return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/* * */

export function VideoPlayer({ poster, src, title }: VideoPlayerProps) {
	//

	//
	// A. Setup variables

	const containerRef = useRef<HTMLDivElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);

	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);
	const [isFullscreen, setIsFullscreen] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);

	//
	// B. Transform data

	const hasDuration = duration > 0;

	//
	// C. Handle lifecycle

	useEffect(() => {
		const handleFullscreenChange = () => {
			setIsFullscreen(document.fullscreenElement === containerRef.current);
		};

		document.addEventListener('fullscreenchange', handleFullscreenChange);

		return () => {
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
		};
	}, []);

	//
	// D. Handle actions

	const handleLoadedMetadata = () => {
		const video = videoRef.current;
		if (!video) return;

		setDuration(video.duration || 0);
		setCurrentTime(video.currentTime || 0);
		setIsMuted(video.muted);
	};

	const handleTimeUpdate = () => {
		const video = videoRef.current;
		if (!video) return;

		setCurrentTime(video.currentTime);
	};

	const handleTogglePlayback = async () => {
		const video = videoRef.current;
		if (!video) return;

		if (video.paused) {
			await video.play();
			return;
		}

		video.pause();
	};

	const handleSeek = (event: ChangeEvent<HTMLInputElement>) => {
		const video = videoRef.current;
		const nextTime = Number(event.currentTarget.value);

		setCurrentTime(nextTime);
		if (video) video.currentTime = nextTime;
	};

	const handleToggleMuted = () => {
		const video = videoRef.current;
		if (!video) return;

		video.muted = !video.muted;
		setIsMuted(video.muted);
	};

	const handleToggleFullscreen = async () => {
		const container = containerRef.current;
		if (!container) return;

		if (document.fullscreenElement) {
			await document.exitFullscreen();
			return;
		}

		await container.requestFullscreen();
	};

	//
	// F. Render components

	return (
		<div ref={containerRef} className={styles.container}>
			<div className={styles.videoStage}>
				<video
					ref={videoRef}
					aria-label={title}
					className={styles.video}
					onClick={handleTogglePlayback}
					onEnded={() => setIsPlaying(false)}
					onLoadedMetadata={handleLoadedMetadata}
					onPause={() => setIsPlaying(false)}
					onPlay={() => setIsPlaying(true)}
					onTimeUpdate={handleTimeUpdate}
					poster={poster}
					preload="metadata"
					src={src}
					playsInline
				/>

				<button
					aria-label={isPlaying ? 'Pausar demo' : 'Reproduzir demo'}
					aria-pressed={isPlaying}
					className={styles.centerButton}
					onClick={handleTogglePlayback}
					type="button"
				>
					{isPlaying ? <IconPlayerPause size={34} stroke={2.4} /> : <IconPlayerPlay size={34} stroke={2.4} />}
				</button>
			</div>

			<div className={styles.controls}>
				<button
					aria-label={isPlaying ? 'Pausar demo' : 'Reproduzir demo'}
					aria-pressed={isPlaying}
					className={styles.iconButton}
					onClick={handleTogglePlayback}
					type="button"
				>
					{isPlaying ? <IconPlayerPause size={22} stroke={2.4} /> : <IconPlayerPlay size={22} stroke={2.4} />}
				</button>

				<input
					aria-label="Progresso do vídeo"
					className={styles.timeline}
					disabled={!hasDuration}
					max={duration || 0}
					min={0}
					onChange={handleSeek}
					step={0.1}
					type="range"
					value={Math.min(currentTime, duration || currentTime)}
				/>

				<span className={styles.time}>
					{formatTime(currentTime)} / {formatTime(duration)}
				</span>

				<button
					aria-label={isMuted ? 'Ativar som' : 'Silenciar'}
					aria-pressed={isMuted}
					className={styles.iconButton}
					onClick={handleToggleMuted}
					type="button"
				>
					{isMuted ? <IconVolumeOff size={22} stroke={2.4} /> : <IconVolume size={22} stroke={2.4} />}
				</button>

				<button
					aria-label={isFullscreen ? 'Sair de ecrã inteiro' : 'Ver em ecrã inteiro'}
					aria-pressed={isFullscreen}
					className={styles.iconButton}
					onClick={handleToggleFullscreen}
					type="button"
				>
					{isFullscreen ? <IconArrowsMinimize size={22} stroke={2.4} /> : <IconArrowsMaximize size={22} stroke={2.4} />}
				</button>
			</div>
		</div>
	);

	//
}
