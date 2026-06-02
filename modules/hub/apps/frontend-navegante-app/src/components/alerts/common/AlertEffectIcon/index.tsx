/* * */

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

	//
	// B. Transform data

	const effectsWithIcons = AlertEffectValues.map(effect => ({
		effect,
		icon: AlertEffectIcons[effect],
	}));

	//
	// C. Render components

	if (withText && effect) {
		return (
			<div className={`${styles.container} ${className && className}`}>
				{effectsWithIcons.find(item => item.effect === effect)?.icon}
				<span className={styles.label}>{t(`shared:alerts.effects.${effect}.title`)}</span>
			</div>
		);
	}

	return effectsWithIcons.find(item => item.effect === effect)?.icon;

	//
}
