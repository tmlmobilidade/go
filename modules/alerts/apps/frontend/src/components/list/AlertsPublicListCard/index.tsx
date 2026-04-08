/* * */

import { getAlertCardSeverityLevel } from '@/lib/alert-severity';
import { IconAffiliate, IconAlertCircle, IconAmbulance, IconBarrierBlock, IconBusStop, IconCirclePlus, IconClockExclamation, IconCloudStorm, IconCreditCard, IconFlag, IconFlame, IconInfoCircle, IconMapPin, IconParkingOff, IconProgressDown, IconRoad, IconRoute, IconShield, IconTool, IconTrafficCone, IconUserExclamation, IconUserMinus, IconUserOff, IconUsersGroup, IconWheelchair, IconX } from '@tabler/icons-react';
import { Dates } from '@tmlmobilidade/dates';
import { type Alert, type AlertCause } from '@tmlmobilidade/types';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface AlertsPublicListCardProps {
	alert: Alert
	description?: string
	title?: string
}

/* * */

const iconProps = {
	className: styles.cardIcon,
	size: 22,
	stroke: 1.75,
} as const;

function AlertsPublicListCardIcon({ alert }: { alert: Alert }) {
	const { cause, effect } = alert;

	switch (effect) {
		case 'ACCESSIBILITY_ISSUE':
			return <IconWheelchair {...iconProps} />;
		case 'ADDITIONAL_SERVICE':
			return <IconCirclePlus {...iconProps} />;
		case 'DETOUR':
		case 'MODIFIED_SERVICE':
			return <IconRoute {...iconProps} />;
		case 'NO_SERVICE':
			return <IconX {...iconProps} />;
		case 'ON_BOARD_SALE_ISSUE':
			return <IconCreditCard {...iconProps} />;
		case 'REALTIME_INFO_ISSUE':
			return <IconInfoCircle {...iconProps} />;
		case 'REDUCED_SERVICE':
			return <IconProgressDown {...iconProps} />;
		case 'SIGNIFICANT_DELAYS':
			return <IconClockExclamation {...iconProps} />;
		case 'STOP_MOVED':
			return <IconMapPin {...iconProps} />;
		default:
			return iconForCause(cause);
	}
}

function iconForCause(cause: AlertCause) {
	switch (cause) {
		case 'ABUSIVE_PARKING':
			return <IconParkingOff {...iconProps} />;
		case 'ACCIDENT':
			return <IconBarrierBlock {...iconProps} />;
		case 'CONSTRUCTION':
			return <IconBarrierBlock {...iconProps} />;
		case 'DEMONSTRATION':
			return <IconFlag {...iconProps} />;
		case 'DRIVER_ABSENCE':
			return <IconUserMinus {...iconProps} />;
		case 'DRIVER_ISSUE':
			return <IconUserExclamation {...iconProps} />;
		case 'HIGH_PASSENGER_LOAD':
			return <IconUsersGroup {...iconProps} />;
		case 'MEDICAL_EMERGENCY':
			return <IconAmbulance {...iconProps} />;
		case 'NETWORK_UPDATE':
			return <IconAffiliate {...iconProps} />;
		case 'POLICE_ACTIVITY':
			return <IconShield {...iconProps} />;
		case 'PUBLIC_DISORDER':
			return <IconFlame {...iconProps} />;
		case 'ROAD_ISSUE':
			return <IconRoad {...iconProps} />;
		case 'STRIKE':
			return <IconUserOff {...iconProps} />;
		case 'TECHNICAL_ISSUE':
			return <IconTool {...iconProps} />;
		case 'TRAFFIC_JAM':
			return <IconTrafficCone {...iconProps} />;
		case 'VEHICLE_ISSUE':
			return <IconBusStop {...iconProps} />;
		case 'WEATHER':
			return <IconCloudStorm {...iconProps} />;
		default:
			return <IconAlertCircle {...iconProps} />;
	}
}

/* * */

export function AlertsPublicListCard({ alert, description, title }: AlertsPublicListCardProps) {
	const { t } = useTranslation();

	const severity = getAlertCardSeverityLevel(alert.cause, alert.effect);

	const activePeriodDates = useMemo(() => {
		const startDate = Dates
			.fromUnixTimestamp(alert.active_period_start_date)
			.setZone('Europe/Lisbon', 'offset_only')
			.toFormat('dd/MM/yyyy HH:mm');
		const endDate = alert.active_period_end_date
			? Dates
				.fromUnixTimestamp(alert.active_period_end_date)
				.setZone('Europe/Lisbon', 'offset_only')
				.toFormat('dd/MM/yyyy HH:mm')
			: t('default:alerts.public.list.card.dates.no_end');
		return { endDate, startDate };
	}, [alert.active_period_end_date, alert.active_period_start_date, t]);

	return (
		<article className={styles.card} data-severity={String(severity)}>
			<div className={styles.header}>
				<span aria-hidden="true" className={styles.iconWrap} data-severity={String(severity)}>
					<AlertsPublicListCardIcon alert={alert} />
				</span>
				<div className={styles.main}>
					{title && <h3 className={styles.title}>{title}</h3>}
					{description && <p className={styles.description}>{description}</p>}
				</div>
			</div>
			<div className={styles.dates}>
				<div className={styles.dateRow}>
					<span className={styles.dateLabel}>{t('default:alerts.public.list.card.dates.start')}</span>
					<span className={styles.dateValue}>{activePeriodDates.startDate}</span>
				</div>
				<div className={styles.dateRow}>
					<span className={styles.dateLabel}>{t('default:alerts.public.list.card.dates.end')}</span>
					<span className={styles.dateValue}>{activePeriodDates.endDate}</span>
				</div>
			</div>
		</article>
	);
}
