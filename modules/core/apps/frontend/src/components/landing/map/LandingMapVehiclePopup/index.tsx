'use client';

import { type HubV1ApiVehiclePosition } from '@tmlmobilidade/go-types-hub';
import { Divider, Label, Section, Surface, UnixMillisecondsDisplay } from '@tmlmobilidade/ui';
import { Popup } from '@vis.gl/react-maplibre';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface LandingMapVehiclePopupProps {
	data: HubV1ApiVehiclePosition
}

/* * */

export function LandingMapVehiclePopup({ data }: LandingMapVehiclePopupProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<Popup
			anchor="bottom"
			className={styles.popup}
			closeButton={false}
			latitude={data.latitude}
			longitude={data.longitude}
			offset={12}
		>
			<Surface elevated>
				<Section gap="md">
					<Label singleLine>{t('landing:LandingMap.popup.route', '', { value: data.route_short_name ?? '-' })}</Label>
					<UnixMillisecondsDisplay value={data.created_at} showSeconds showTime />
				</Section>
				<Divider />
				<Section gap="md">
					<Label singleLine>{t('landing:LandingMap.popup.vehicle', '', { value: data.license_plate ?? data.vehicle_id })}</Label>
					<Label singleLine>{t('landing:LandingMap.popup.agency', '', { value: data.agency_id })}</Label>
					<Label singleLine>{t('landing:LandingMap.popup.speed', '', { value: data.speed ?? '-' })}</Label>
					<Label singleLine>{t('landing:LandingMap.popup.status', '', { value: data.current_status ?? '-' })}</Label>
				</Section>
			</Surface>
		</Popup>
	);

	//
}
