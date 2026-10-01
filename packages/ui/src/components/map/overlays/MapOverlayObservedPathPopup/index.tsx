'use client';

import { Popup } from '@vis.gl/react-maplibre';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { UnixMillisecondsDisplay } from '../../../../display';
import { Label } from '../../../display';
import { Divider, Section, Surface } from '../../../layout';
import { IdTag } from '../../../tags';
import { type MapOverlayObservedPathPointsDataProps } from '../MapOverlayObservedPath';

/* * */

interface MapOverlayObservedPathPopupProps {
	data: MapOverlayObservedPathPointsDataProps
	latitude: number
	longitude: number
	totalCount: number
}

/* * */

export function MapOverlayObservedPathPopup({ data, latitude, longitude, totalCount }: MapOverlayObservedPathPopupProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const shortenedVehicleEventId = useMemo(() => {
		// Keep only the first 16 and the last 5 characters
		return `${data._id.slice(0, 16)}...${data._id.slice(-5)}`;
	}, [data?._id]);

	//
	// C. Render components

	return (
		<Popup
			anchor="bottom"
			className={styles.popup}
			closeButton={false}
			latitude={latitude}
			longitude={longitude}
			offset={12}
		>
			<Surface elevated>
				<Section gap="md">
					<Section alignItems="center" flexDirection="row" gap="md" justifyContent="space-between" padding="none">
						<IdTag displayId={shortenedVehicleEventId} id="" copyOnClick />
						<Label variant="muted" singleLine>{t('shared:map.overlays.MapOverlayObservedPathPopup.position', '', { index_position: data.index_position, total_count: totalCount })}</Label>
					</Section>
					<UnixMillisecondsDisplay value={data.created_at} showDate showSeconds showTime />
				</Section>
				<Divider />
				<Section gap="md">
					<Label singleLine>{t('shared:map.overlays.MapOverlayObservedPathPopup.vehicle_id', '', { vehicle_id: data.vehicle_id })}</Label>
					<Label singleLine>{t('shared:map.overlays.MapOverlayObservedPathPopup.driver_id', '', { driver_id: data.driver_id ?? '-' })}</Label>
					<Label singleLine>{t('shared:map.overlays.MapOverlayObservedPathPopup.speed', '', { speed: data.speed ?? '-' })}</Label>
					<Label singleLine>{t('shared:map.overlays.MapOverlayObservedPathPopup.bearing', '', { bearing: data.bearing ?? '-' })}</Label>
					<Label singleLine>{t('shared:map.overlays.MapOverlayObservedPathPopup.stop_id', '', { stop_id: data.stop_id ?? '-' })}</Label>
				</Section>
			</Surface>
		</Popup>
	);
}
