'use client';

import { Popup } from '@vis.gl/react-maplibre';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { Label, Text } from '../../../display';
import { Divider, Section, Surface } from '../../../layout';
import { IdTag } from '../../../tags';

/* * */

interface MapOverlayScheduledPathPopupProps {
	arrivalTime: string
	latitude: number
	longitude: number
	passengersObserved: number
	pathLength: number
	stopId: string
	stopName: string
	stopSequence: number
}

/* * */

export function MapOverlayScheduledPathPopup({ arrivalTime, latitude, longitude, passengersObserved, pathLength, stopId, stopName, stopSequence }: MapOverlayScheduledPathPopupProps) {
	//

	const { t } = useTranslation();

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
						<IdTag id={stopId} copyOnClick />
						<Label variant="muted" singleLine>{t('shared:map.overlays.MapOverlayScheduledPathPopup.stop_sequence', '', { path_length: pathLength, stop_sequence: stopSequence })}</Label>
					</Section>
					<Label>{stopName}</Label>
				</Section>
				<Divider />
				<Section gap="md">
					<Text style={{ textWrap: 'nowrap' }}>{t('shared:map.overlays.MapOverlayScheduledPathPopup.arrival_time', '', { arrival_time: arrivalTime })}</Text>
					<Text>{t('shared:map.overlays.MapOverlayScheduledPathPopup.passengers_observed', '', { passengers_observed: passengersObserved })}</Text>
				</Section>
			</Surface>
		</Popup>
	);
}
