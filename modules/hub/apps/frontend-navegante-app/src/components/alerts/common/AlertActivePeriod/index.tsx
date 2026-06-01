/* * */

import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface AlertActivePeriodEndProps {
	date?: Date
	size?: 'md' | 'sm'
}

interface AlertActivePeriodStartProps {
	date?: Date
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

	if (date && !isNaN(date.getTime())) {
		// return <p className={`${styles.text} ${styles[size]}`}>{t('end', { end: date, parsedDate: chunks => <strong>{chunks}</strong> })}</p>;
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

	if (date && !isNaN(date.getTime())) {
		// return <p className={`${styles.text} ${styles[size]}`}>{t.rich('start', { parsedDate: chunks => <strong>{chunks}</strong>, start: date })}</p>;
	}

	//
}
