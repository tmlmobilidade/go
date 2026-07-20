'use client';

import { ActionBarUserLocation } from '@/components/common/action-bar/ActionBarUserLocation';
import { useMapFloatingControlsLayout } from '@/hooks/useMapFloatingControlsLayout';

import styles from './styles.module.css';

/* * */

export function ActionBar() {
	//

	//
	// A. Setup variables

	const controlsLayout = useMapFloatingControlsLayout();

	//
	// B. Render components

	return (
		<div
			className={styles.container}
			data-layout={controlsLayout.layout}
			style={controlsLayout.layout === 'above-sheet' ? { bottom: `calc(var(--active-map-bottom-sheet-height, ${controlsLayout.bottomOffsetPx}px) + env(safe-area-inset-bottom, 0px) + 20px)` } : undefined}
		>
			<ActionBarUserLocation />
		</div>
	);
}
