/* * */

import { getCauseSeverityLevel } from '@/utils/get-alert-severity-level';
import { GtfsRtCause, GtfsRtCauseValues } from '@tmlmobilidade/go-types-gtfs-rt';
import { AlertCauseIcons } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface AlertCauseIconProps {
	cause?: GtfsRtCause
	className?: string
	size?: 'lg' | 'md'
	withText?: boolean
}
/* * */

export function AlertCauseIcon({ cause, className, size, withText = false }: AlertCauseIconProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const severityColor = {
		high: styles.severityLevel_high,
		info: styles.severityLevel_info,
		low: styles.severityLevel_low,
		medium: styles.severityLevel_medium,
	};

	//
	// B. Transform data

	const causesWithIcons = GtfsRtCauseValues.map(cause => ({
		cause,
		color: severityColor[getCauseSeverityLevel(cause)],
		icon: AlertCauseIcons[cause],
	}));

	//
	// C. Render components

	const causeItem = causesWithIcons.find(item => item.cause === cause);

	if (withText && cause && causeItem) {
		return (
			<div className={`${styles.container} ${className ?? ''} ${causeItem.color}`}>
				{causeItem.icon}
				{/* <span className={styles.label}>{t(`shared:alerts.causes.${cause}.title`)}</span> */}
			</div>
		);
	}

	if (!causeItem) {
		return null;
	}

	return <span className={causeItem.color}>{causeItem.icon}</span>;

	//
}
