/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type OperationalDate } from '@tmlmobilidade/types';
import { Tag, Tooltip } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface AnnotationsListCellDatesProps {
	dates: OperationalDate[]
}

/* * */

export function AnnotationsListCellDates({ dates }: AnnotationsListCellDatesProps) {
	//

	//
	// A. Transform data

	const MAX_VISIBLE_DATES = 2;

	const allDatesFormatted = dates
		.sort((a, b) => Number(a) - Number(b))
		.map(date => Dates
			.fromOperationalDate(date, 'Europe/Lisbon')
			.toFormat('dd-MM-yyyy'),
		);

	const visibleDates = allDatesFormatted.slice(0, MAX_VISIBLE_DATES);
	const remainingCount = allDatesFormatted.length - MAX_VISIBLE_DATES;

	//
	// B. Render components

	return (
		<div className={styles.wrapper}>
			{visibleDates.map(dateFormatted => (
				<Tag key={dateFormatted} label={dateFormatted} variant="secondary" />
			))}
			{remainingCount > 0 && (
				<Tooltip label={allDatesFormatted.slice(MAX_VISIBLE_DATES).join(', ')}>
					<Tag label={`+${remainingCount} mais`} variant="muted" />
				</Tooltip>
			)}
		</div>
	);

	//
}
