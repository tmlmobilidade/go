'use client';

/* * */

import TextPopover from '@/components/Common/TextPopover';
import { useMapOptionsContext } from '@/components/map/view/MapOptions.context';
import { SegmentedControl, SegmentedControlItem } from '@mantine/core';
import { IconArrowsMinimize, IconMapShare } from '@tabler/icons-react';

import styles from './styles.module.css';

/* * */

interface Props {
	className?: string
	onCenterMap?: () => void
}

/* * */

export function MapViewToolbar({ className, onCenterMap }: Props) {
	//

	//
	// A. Setup variables

	const mapOptionsContext = useMapOptionsContext();

	const mapStyles: SegmentedControlItem[] = [
		{ label: 'Mapa', value: 'map' },
		{ label: 'Satelite', value: 'satellite' },
	];

	//
	// B. Handle actions

	const handleOpenInGoogle = () => {
		const map = mapOptionsContext.data.map;
		if (!map) return;
		const center = map.getCenter();
		window.open(`https://www.google.com/maps?q=${center.lat},${center.lng}&z=${map.getZoom() + 2}`, '_blank');
	};

	//
	// C. Render components

	return (
		<div className={`${styles.container} ${className ?? ''}`}>
			<SegmentedControl classNames={{ label: styles.segmentedControlLabel }} data={mapStyles} onChange={mapOptionsContext.actions.setStyle} value={mapOptionsContext.data.style} />
			{onCenterMap && (
				<button className={styles.button} onClick={onCenterMap}>
					<TextPopover text="Centrar Mapa" textSize="md">
						<IconArrowsMinimize />
					</TextPopover>
				</button>
			)}
			<button className={styles.button} onClick={handleOpenInGoogle}>
				<TextPopover text="Google Maps" textSize="md">
					<IconMapShare />
				</TextPopover>
			</button>
		</div>
	);

	//
}
