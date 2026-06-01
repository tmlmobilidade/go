/* * */

import { IconAccessible, IconAmbulance, IconArrowBigUpLines, IconBarrierBlock, IconCalendarEvent, IconCarCrash, IconCircleArrowDown, IconCircleMinus, IconClock2, IconClockExclamation, IconCloudStorm, IconFish, IconInfoTriangle, IconRoadOff, IconRouteAltRight, IconServerCog, IconSettings, IconSpeakerphone, IconTool, IconTrafficCone } from '@tabler/icons-react';
import { type AlertCause, type AlertEffect } from '@tmlmobilidade/types';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface AlertCauseIconProps {
	cause?: AlertCause
	className?: string
	size?: 'lg' | 'md'
	withText?: boolean
}

interface AlertEffectIconProps {
	className?: string
	effect?: AlertEffect
	size?: 'lg' | 'md'
	withText?: boolean
}

/* * */

export function AlertCauseIcon({ cause, className, size, withText = false }: AlertCauseIconProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	let icon: React.ReactNode;
	const iconSize = size === 'md' ? 20 : size === 'lg' ? 30 : 20;
	switch (cause) {
		case 'ABUSIVE_PARKING':
		case 'ACCIDENT':
		case 'DRIVER_ABSENCE':
		case 'DRIVER_ISSUE':
		case 'NETWORK_UPDATE':
		case 'PUBLIC_DISORDER':
			icon = <IconCarCrash className={styles.severityLevel_3} size={iconSize} />;
			break;
		case 'CONSTRUCTION':
			icon = <IconBarrierBlock className={styles.severityLevel_3} size={iconSize} />;
			break;
		case 'DEMONSTRATION':
		case 'STRIKE':
			icon = <IconSpeakerphone className={styles.severityLevel_3} size={iconSize} />;
			break;
		case 'HIGH_PASSENGER_LOAD':
			icon = <IconFish className={styles.severityLevel_3} size={20} style={{ transform: 'rotate(90deg) ' }} />;
			break;
		case 'MEDICAL_EMERGENCY':
			icon = <IconTool className={styles.severityLevel_3} size={iconSize} />;
			break;
		case 'POLICE_ACTIVITY':
			icon = <IconAmbulance className={styles.severityLevel_3} size={iconSize} />;
			break;
		case 'ROAD_ISSUE':
			icon = <IconRoadOff className={styles.severityLevel_3} size={20} />;
			break;
		case 'TECHNICAL_ISSUE':
			icon = <IconServerCog className={styles.severityLevel_3} size={20} />;
			break;
		case 'TRAFFIC_JAM':
			icon = <IconTrafficCone className={styles.severityLevel_3} size={20} />;
			break;
		case 'VEHICLE_ISSUE':
			icon = <IconSettings className={styles.severityLevel_2} size={20} />;
			break;
		case 'WEATHER':
			icon = <IconCloudStorm className={styles.severityLevel_2} size={iconSize} />;
			break;
		default:
			icon = <IconInfoTriangle className={styles.severityLevel_2} size={iconSize} />;
			break;
	}

	//
	// C. Render components

	if (withText && icon && cause) {
		return (
			<div className={`${styles.container} ${className && className}`}>
				{icon}
				<span className={styles.label}>{t(`shared:alerts.causes.${cause}.title`)}</span>
			</div>
		);
	}

	return icon;

	//
}

/* * */

export function AlertEffectIcon({ className, effect, size, withText = false }: AlertEffectIconProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	let icon: React.ReactNode;
	const iconSize = size === 'md' ? 20 : size === 'lg' ? 30 : 20;
	switch (effect) {
		case 'ACCESSIBILITY_ISSUE':
		case 'ON_BOARD_SALE_ISSUE':
		case 'REALTIME_INFO_ISSUE':
		case 'STOP_MOVED':
			icon = <IconAccessible className={styles.severityLevel_0} size={iconSize} />;
			break;
		case 'ADDITIONAL_SERVICE':
			icon = <IconArrowBigUpLines className={styles.severityLevel_1} size={iconSize} />;
			break;
		case 'DETOUR':
			icon = <IconRouteAltRight className={styles.severityLevel_2} size={iconSize} />;
			break;
		case 'MODIFIED_SERVICE':
			icon = <IconClock2 className={styles.severityLevel_0} size={iconSize} />;
			break;
		case 'NO_SERVICE':
			icon = <IconCircleMinus className={styles.severityLevel_3} size={iconSize} />;
			break;
		case 'REDUCED_SERVICE':
			icon = <IconCircleArrowDown className={styles.severityLevel_3} size={iconSize} />;
			break;
		case 'SIGNIFICANT_DELAYS':
			icon = <IconClockExclamation className={styles.severityLevel_3} size={iconSize} />;
			break;
		default:
			icon = <IconInfoTriangle className={styles.severityLevel_2} size={iconSize} />;
			break;
	}

	//
	// C. Render components

	if (withText && icon && effect) {
		return (
			<div className={`${styles.container} ${className && className}`}>
				{icon}
				<span className={styles.label}>{t(`shared:alerts.effects.${effect}.title`)}</span>
			</div>
		);
	}

	return icon;

	//
}
