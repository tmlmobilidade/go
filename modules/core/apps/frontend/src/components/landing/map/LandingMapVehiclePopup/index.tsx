'use client';

import { IconClock, IconGauge } from '@tabler/icons-react';
import { type HubV1ApiVehiclePosition } from '@tmlmobilidade/go-types-hub';
import { IdTag, Image, LineBadge, Surface, Tag, type TagProps } from '@tmlmobilidade/ui';
import { Popup } from '@vis.gl/react-maplibre';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { useLandingVehiclePopupData } from './use-landing-vehicle-popup-data';

/* * */

const STATUS_VARIANTS: Record<NonNullable<HubV1ApiVehiclePosition['current_status']>, TagProps['variant']> = {
	IN_TRANSIT_TO: 'primary',
	INCOMING_AT: 'warning',
	STOPPED_AT: 'success',
};

/* * */

interface LandingMapVehiclePopupProps {
	data: HubV1ApiVehiclePosition
	onMouseEnter: () => void
	onMouseLeave: () => void
}

/* * */

export function LandingMapVehiclePopup({ data, onMouseEnter, onMouseLeave }: LandingMapVehiclePopupProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { agencyLogoSrc, agencyName, route } = useLandingVehiclePopupData(data.agency_id, data.route_id);

	const displayAgencyName = agencyName ?? data.agency_id;
	const vehicleNumber = data.vehicle_id.replace(/^\[[^\]]+\]/, '');

	//
	// B. Render components

	return (
		<Popup
			anchor="bottom"
			className={styles.popup}
			closeButton={false}
			closeOnClick={false}
			latitude={data.latitude}
			longitude={data.longitude}
			offset={12}
		>
			<div onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
				<Surface elevated>
					<div className={styles.agency}>
						{agencyLogoSrc
							? <Image alt="" className={styles.agencyLogo} src={agencyLogoSrc} />
							: <span className={styles.agencyInitials}>{displayAgencyName.slice(0, 2)}</span>}
						<span className={styles.agencyName}>{displayAgencyName}</span>
						<IdTag displayId={`#${vehicleNumber}`} id={data.vehicle_id} copyOnClick />
					</div>

					<div className={styles.body}>
						<div className={styles.line}>
							<LineBadge color={route?.color} shortName={data.route_short_name ?? route?.short_name} textColor={route?.text_color} />
							{route?.long_name && <span className={styles.lineName}>{route.long_name}</span>}
						</div>
						{(data.current_status || data.speed !== null) && (
							<div className={styles.tags}>
								{data.current_status && <Tag label={t(`landing:LandingMap.popup.status.${data.current_status}`)} variant={STATUS_VARIANTS[data.current_status]} />}
								{data.speed !== null && <Tag icon={<IconGauge />} label={t('landing:LandingMap.popup.speed', '', { value: Math.round(data.speed) })} variant="muted" />}
							</div>
						)}
					</div>

					<div className={styles.footer}>
						<IconClock size={14} />
						{t('landing:LandingMap.popup.last_position', '', { value: new Date(data.created_at) })}
					</div>
				</Surface>
			</div>
		</Popup>
	);

	//
}
