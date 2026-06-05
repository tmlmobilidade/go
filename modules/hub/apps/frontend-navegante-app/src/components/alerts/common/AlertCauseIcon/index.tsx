/* * */

import { type AlertCause, AlertCauseValues } from '@tmlmobilidade/types';
import { AlertCauseIcons } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface AlertCauseIconProps {
	cause?: AlertCause
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

	//
	// B. Transform data

	const causesWithIcons = AlertCauseValues.map(cause => ({
		cause,
		icon: AlertCauseIcons[cause],
	}));

	//
	// C. Render components

	if (withText && cause) {
		return (
			<div className={`${styles.container} ${className && className}`}>
				{causesWithIcons.find(item => item.cause === cause)?.icon}
				<span className={styles.label}>{t(`shared:alerts.causes.${cause}.title`)}</span>
			</div>
		);
	}

	return causesWithIcons.find(item => item.cause === cause)?.icon;

	//
}
