/* * */

import { UnixTimestamp } from '@tmlmobilidade/types';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface AlertActivePeriodEndProps {
	date?: UnixTimestamp
	size?: 'md' | 'sm'
}

interface AlertActivePeriodStartProps {
	date?: UnixTimestamp
	size?: 'md' | 'sm'
}

/* * */

export function AlertActivePeriodEnd({ date, size = 'md' }: AlertActivePeriodEndProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	if (date && !isNaN(date)) {
		return <p className={`${styles.text} ${styles[size]}`}>{t('default:alerts.AlertActivePeriod.start', '', { value: date })}</p>;
	}

	//
}

/* * */

export function AlertActivePeriodStart({ date, size = 'md' }: AlertActivePeriodStartProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	if (date && !isNaN(date)) {
		return <p className={`${styles.text} ${styles[size]}`}>{t('default:alerts.AlertActivePeriod.start', '', { value: date })}</p>;
	}

	//
}
