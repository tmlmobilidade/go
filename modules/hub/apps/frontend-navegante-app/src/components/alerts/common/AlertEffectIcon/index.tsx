/* * */

import { getEffectSeverityLevel } from '@/utils/get-alert-severity-level';
import { type AlertEffect, AlertEffectValues } from '@tmlmobilidade/types';
import { AlertEffectIcons } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface AlertEffectIconProps {
	className?: string
	effect?: AlertEffect
	size?: 'lg' | 'md'
	withText?: boolean
}

/* * */

export function AlertEffectIcon({ className, effect, size, withText = false }: AlertEffectIconProps) {
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

	const effectsWithIcons = AlertEffectValues.map(effect => ({
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
				<span className={styles.label}>{t(`shared:alerts.effects.${effect}.title`)}</span>
			</div>
		);
	}

	if (!effectItem) {
		return null;
	}

	return <span className={effectItem.color}>{effectItem.icon}</span>;

	//
}
