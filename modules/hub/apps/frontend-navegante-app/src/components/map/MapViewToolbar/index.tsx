'use client';

import TextPopover from '@/components/common/TextPopover';
import { useMapOptionsContext } from '@/contexts/MapOptions.context';
import { SegmentedControl, SegmentedControlItem } from '@mantine/core';
import { IconArrowsMinimize, IconMapShare, IconZoomScan } from '@tabler/icons-react';
import classNames from 'classnames';
import { useTranslations } from 'next-intl';

import styles from './styles.module.css';

/* * */

interface Props {
	autoZoom?: boolean
	className?: string
	onCenterMap?: () => void
	showCenterButton?: boolean
	toolbarExtras?: React.ReactNode
}

/* * */

export function MapViewToolbar({ autoZoom, className, onCenterMap, showCenterButton = false, toolbarExtras }: Props) {
	//

	//
	// A. Setup variables

	const t = useTranslations('map.toolbar');

	const mapOptionsContext = useMapOptionsContext();

	const mapStyles: SegmentedControlItem[] = [
		{ label: t('style.map'), value: 'map' },
		{ label: t('style.satellite'), value: 'satellite' },
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
		<div className={classNames(styles.container, className)}>
			<div className={styles.left}>
				<SegmentedControl classNames={{ label: styles.segmentedControlLabel }} data={mapStyles} onChange={mapOptionsContext.actions.setStyle} value={mapOptionsContext.data.style} />
				{showCenterButton && onCenterMap && (
					<button className={styles.button} onClick={onCenterMap}>
						<TextPopover text={t('center_map')} textSize="md">
							{autoZoom ? <IconZoomScan /> : <IconArrowsMinimize />}
						</TextPopover>
					</button>
				)}
				<button className={styles.button} onClick={handleOpenInGoogle}>
					<TextPopover text={t('open_google_maps')} textSize="md">
						<IconMapShare />
					</TextPopover>
				</button>
			</div>
			{toolbarExtras}
		</div>
	);

	//
}
