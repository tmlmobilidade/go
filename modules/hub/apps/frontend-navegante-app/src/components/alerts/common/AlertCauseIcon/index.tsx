/* * */

import { type AlertSeverityLevel, getCauseSeverityLevel } from '@/utils/alerts/get-alert-severity-level';
import { type GtfsRtCause } from '@tmlmobilidade/go-types-gtfs-rt';
import { AlertCauseIcons } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface AlertCauseIconProps {
	cause?: GtfsRtCause
	className?: string
	size?: 'lg' | 'md'
	withText?: boolean
}

/* * */

const SEVERITY_CLASS_NAMES: Record<AlertSeverityLevel, string> = {
	high: styles.levelHigh,
	info: styles.levelInfo,
	low: styles.levelLow,
	medium: styles.levelMedium,
};

/* * */

export function AlertCauseIcon({ cause, className, size = 'md', withText = false }: AlertCauseIconProps) {
	//

	//
	// A. Transform data

	const causeIcon = cause ? AlertCauseIcons[cause] : null;
	const severityClassName = cause ? SEVERITY_CLASS_NAMES[getCauseSeverityLevel(cause)] : null;
	const sizeClassName = size === 'lg' ? styles.sizeLg : styles.sizeMd;

	//
	// B. Render components

	if (!causeIcon || !severityClassName) {
		return null;
	}

	if (withText) {
		return (
			<div className={`${styles.container} ${severityClassName} ${sizeClassName} ${className ?? ''}`}>
				{causeIcon}
			</div>
		);
	}

	return <span className={`${styles.icon} ${severityClassName} ${sizeClassName} ${className ?? ''}`}>{causeIcon}</span>;

	//
}
