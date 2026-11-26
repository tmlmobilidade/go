'use client';

import { IconX } from '@tabler/icons-react';
import { useFocusTrap, useMergedRef } from '@tmlmobilidade/ui';
import { type RefObject, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { LandingMap } from '../LandingMap';

/* * */

interface LandingMapFullscreenProps {
	containerRef: RefObject<HTMLDivElement | null>
	onClose: () => void
}

/* * */

export function LandingMapFullscreen({ containerRef, onClose }: LandingMapFullscreenProps) {
	//
	// A. Setup variables

	const { t } = useTranslation();
	const wasFullscreen = useRef(false);
	const focusTrapRef = useFocusTrap();
	const mergedRef = useMergedRef(containerRef, focusTrapRef);

	//
	// B. Handle fullscreen exit

	useEffect(() => {
		const previousOverflow = document.documentElement.style.overflow;
		document.documentElement.style.overflow = 'hidden';
		const handleFullscreenChange = () => {
			if (document.fullscreenElement === containerRef.current) wasFullscreen.current = true;
			else if (wasFullscreen.current) onClose();
		};
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && !document.fullscreenElement) onClose();
		};
		document.addEventListener('fullscreenchange', handleFullscreenChange);
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.documentElement.style.overflow = previousOverflow;
			document.removeEventListener('fullscreenchange', handleFullscreenChange);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [containerRef, onClose]);

	//
	// C. Render components

	return createPortal(
		<div ref={mergedRef} aria-label={t('landing:LandingMap.explore')} className={styles.container} role="region">
			<LandingMap fitToVehicles interactive />
			<button aria-label={t('landing:LandingMap.close')} className={styles.close} onClick={onClose} type="button" data-autofocus>
				<IconX aria-hidden="true" size={24} />
			</button>
		</div>,
		document.body,
	);
}
