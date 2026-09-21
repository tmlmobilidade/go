/* * */

import { getEffectSeverityLevel } from '@/utils/get-alert-severity-level';
import { GtfsRtEffect, GtfsRtEffectValues } from '@tmlmobilidade/go-types-gtfs-rt';
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

export function AlertEffectIcon({ className, effect, withText = false }: AlertEffectIconProps) {
	//

	//
	// A. Setup variables

	const severityColor = {
		high: styles.levelHigh,
		info: styles.levelInfo,
		low: styles.levelLow,
		medium: styles.levelMedium,
	};

	//
	// B. Transform data

	const effectsWithIcons = GtfsRtEffectValues.map(effect => ({
		color: severityColor[getEffectSeverityLevel(effect)],
		effect,
		icon: AlertEffectIcons[effect],
	}));

	//
	// C. Render components

	const effectItem = effectsWithIcons.find(item => item.effect === effect);

	if (withText && effect && effectItem) {
		return (
			<div className={`${styles.container} ${className ?? ''} ${effectItem.color}`}>
				{effectItem.icon}
				{/* <span className={styles.label}>{t(`shared:alerts.effects.${effect}.title`)}</span> */}
			</div>
		);
	}

	if (!effectItem) {
		return null;
	}

	return <span className={`${effectItem.color} ${className ?? ''}`}>{effectItem.icon}</span>;

	//
}
