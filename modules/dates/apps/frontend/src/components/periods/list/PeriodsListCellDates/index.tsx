/* * */

import { IconArrowRight } from '@tabler/icons-react';
import { Dates } from '@tmlmobilidade/dates';
import { type OperationalDate } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface PeriodsListCellDatesProps {
	endDate?: OperationalDate
	startDate?: OperationalDate
}

/* * */

export function PeriodsListCellDates({ endDate, startDate }: PeriodsListCellDatesProps) {
	//

	//
	// A. Transform data

	const startDateFormatted = startDate
		? Dates.fromOperationalDate(startDate, 'Europe/Lisbon').toFormat('dd-MM-yyyy')
		: '—';

	const endDateFormatted = endDate
		? Dates.fromOperationalDate(endDate, 'Europe/Lisbon').toFormat('dd-MM-yyyy')
		: '—';

	//
	// B. Render components

	if (!startDate && !endDate) {
		return <Tag label="Sem datas definidas" variant="secondary" />;
	}

	return (
		<div className={styles.wrapper}>
			<Tag label={startDateFormatted} variant="secondary" />
			<IconArrowRight size={16} />
			<Tag label={endDateFormatted} variant="secondary" />
		</div>
	);

	//
}
