'use client';

import { useMapContext } from '@/components/map/Map.context';
import { SegmentedControl, SegmentedControlItem } from '@mantine/core';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { MapStyle } from '../MapView';

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

	const { t } = useTranslation();

	const mapContext = useMapContext();

	const mapStyles: SegmentedControlItem[] = [
		{ label: t('default:map.MapViewToolbar.style.map'), value: 'map' },
		{ label: t('default:map.MapViewToolbar.style.satellite'), value: 'satellite' },
	];

	//
	// B. Handle actions

	const handleSetStyle = (value: MapStyle) => {
		mapContext.actions.setStyle(value);
	};

	const handleOpenInGoogle = () => {
		const map = mapContext.data.map;
		if (!map) return;

		const center = map.getCenter();
		window.open(`https://www.google.com/maps?q=${center.lat},${center.lng}&z=${map.getZoom() + 2}`, '_blank');
	};

	//
	// C. Render components

	return (
		<div className={classNames(styles.container, className)}>
			<div className={styles.left}>
				<SegmentedControl classNames={{ label: styles.segmentedControlLabel }} data={mapStyles} onChange={handleSetStyle} value={mapContext.data.style} />
				{/* {showCenterButton && onCenterMap && (
					<button className={styles.button} onClick={onCenterMap}>
						<TextPopover text={t('center_map')} textSize="md">
							{autoZoom ? <IconZoomScan /> : <IconArrowsMinimize />}
						</TextPopover>
					</button>
				)} */}
				{/* <button className={styles.button} onClick={handleOpenInGoogle}>
					<TextPopover text={t('open_google_maps')} textSize="md">
						<IconMapShare />
					</TextPopover>
				</button> */}
			</div>
			{toolbarExtras}
		</div>
	);

	//
}
