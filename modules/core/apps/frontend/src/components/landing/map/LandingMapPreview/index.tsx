'use client';

import { IconArrowsMaximize } from '@tabler/icons-react';
import { useCallback, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { LandingSection } from '../../shared/LandingContainer';
import { LandingStats } from '../../stats/LandingStats';
import { LandingMap } from '../LandingMap';
import { LandingMapFullscreen } from '../LandingMapFullscreen';
import { openLandingMapModal } from '../LandingMapModal';

/* * */

export function LandingMapPreview() {
	//
	// A. Setup variables

	const { t } = useTranslation();
	const [isFullscreen, setIsFullscreen] = useState(false);
	const fullscreenRef = useRef<HTMLDivElement>(null);
	const exploreRef = useRef<HTMLButtonElement>(null);

	//
	// B. Handle actions

	const handleClose = useCallback(() => {
		if (document.fullscreenElement && document.fullscreenElement === fullscreenRef.current) {
			void document.exitFullscreen().catch(() => undefined);
		}
		setIsFullscreen(false);
		requestAnimationFrame(() => exploreRef.current?.focus({ preventScroll: true }));
	}, []);

	const handleExplore = () => {
		if (!window.matchMedia('(max-width: 800px)').matches) {
			openLandingMapModal();
			return;
		}
		// Mount before requesting fullscreen to preserve the click's user activation.
		flushSync(() => setIsFullscreen(true));
		// Keep the viewport-filling view if fullscreen is unavailable or denied.
		void fullscreenRef.current?.requestFullscreen?.().catch(() => undefined);
	};

	//
	// C. Render components

	return (
		<LandingSection>
			<div className={styles.container}>
				<div className={styles.map}>
					<LandingMap />
					<button ref={exploreRef} className={styles.overlay} onClick={handleExplore} type="button">
						<span className={styles.hoverLayer}>
							<span className={styles.hoverIcon}>
								<IconArrowsMaximize size={36} stroke={2} />
							</span>
						</span>
						<span className={styles.action}>
							<IconArrowsMaximize size={18} />
							{t('landing:LandingMap.explore')}
						</span>
					</button>
				</div>
				<div className={styles.stats}>
					<LandingStats />
				</div>
			</div>
			{isFullscreen && <LandingMapFullscreen containerRef={fullscreenRef} onClose={handleClose} />}
		</LandingSection>
	);

	//
}
