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
		return <p className={`${styles.text} ${styles[size]}`}>{t('default:alerts.AlertActivePeriod.end', '', { end: date, parsedDate: chunks => <strong>{chunks}</strong> })}</p>;
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
		return <p className={`${styles.text} ${styles[size]}`}>{t('default:alerts.AlertActivePeriod.start', '', { parsedDate: chunks => <strong>{chunks}</strong>, start: date })}</p>;
	}

	//
}
