/* * */

import { IconArrowRight } from '@tabler/icons-react';
import { type OperationalDate } from '@tmlmobilidade/types';
import { Tag } from '@tmlmobilidade/ui';
import { Dates } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

/* * */

interface PlansListCellFeedDatesProps {
	endDate: OperationalDate
	startDate: OperationalDate
}

/* * */

export function PlansListCellFeedDates({ endDate, startDate }: PlansListCellFeedDatesProps) {
	//

	//
	// A. Transform data

	const startDateFormatted = Dates
		.fromOperationalDate(startDate, 'Europe/Lisbon')
		.toFormat('dd-MM-yyyy');

	const endDateFormatted = Dates
		.fromOperationalDate(endDate, 'Europe/Lisbon')
		.toFormat('dd-MM-yyyy');

	//
	// B. Render components

	return (
		<div className={styles.wrapper}>
			<Tag label={startDateFormatted} variant="secondary" />
			<IconArrowRight size={16} />
			<Tag label={endDateFormatted} variant="secondary" />
		</div>
	);

	//
}
