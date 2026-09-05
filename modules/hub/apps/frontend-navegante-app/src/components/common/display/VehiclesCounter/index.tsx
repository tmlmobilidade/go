'use client';

import { LiveIcon } from '@/components/common/display/LiveIcon';
import { useMapContext } from '@/contexts/Map.context';
import { useMapFloatingControlsLayout } from '@/hooks/base-map/useMapFloatingControlsLayout';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface VehiclesCounterProps {
	count?: number
}

export function VehiclesCounter({ count }: VehiclesCounterProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const controlsLayout = useMapFloatingControlsLayout();
	const { data: { activeBaseMapOverlays } } = useMapContext();

	//
	// B. Render components

	if (!activeBaseMapOverlays.includes('vehicles')) return null;

	return (
		<div
			className={styles.container}
			data-layout={controlsLayout.layout}
			data-zero-count={!count}
			style={controlsLayout.layout === 'above-sheet' ? { bottom: `calc(var(--active-map-bottom-sheet-height, ${controlsLayout.bottomOffsetPx}px) + env(safe-area-inset-bottom, 0px) + 20px)` } : undefined}
			aria-hidden
		>
			<LiveIcon color={!count ? 'var(--color-system-text-300)' : 'var(--color-status-live-primary)'} />
			<p className={styles.label}>{t('default:vehicles.VehiclesCounter.label', '', { count })}</p>
		</div>
	);
}
