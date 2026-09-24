/* * */

import { type AlertSeverityLevel, getEffectSeverityLevel } from '@/utils/alerts/get-alert-severity-level';
import { type GtfsRtEffect } from '@tmlmobilidade/go-types-gtfs-rt';
import { AlertEffectIcons } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface AlertEffectIconProps {
	className?: string
	effect?: GtfsRtEffect
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

export function AlertEffectIcon({ className, effect, size = 'md', withText = false }: AlertEffectIconProps) {
	//

	//
	// A. Transform data

	const effectIcon = effect ? AlertEffectIcons[effect] : null;
	const severityClassName = effect ? SEVERITY_CLASS_NAMES[getEffectSeverityLevel(effect)] : null;
	const sizeClassName = size === 'lg' ? styles.sizeLg : styles.sizeMd;

	//
	// B. Render components

	if (!effectIcon || !severityClassName) {
		return null;
	}

	if (withText) {
		return (
			<div className={`${styles.container} ${severityClassName} ${sizeClassName} ${className ?? ''}`}>
				{effectIcon}
			</div>
		);
	}

	return <span className={`${styles.icon} ${severityClassName} ${sizeClassName} ${className ?? ''}`}>{effectIcon}</span>;

	//
}
