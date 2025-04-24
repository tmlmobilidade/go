import { cn } from '@/lib/utils';
import { OperationalDate } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

export default function DateCell({ date, endDate }: { date: OperationalDate, endDate: OperationalDate }) {
	//

	//
	// A. Setup variables
	const parsedDate = date ? Dates.fromOperationalDate(date).jsDate : null;
	const parsedEndDate = endDate ? Dates.fromOperationalDate(endDate).jsDate : null;
	//
	// B. Render
	return (
		<div className={styles.wrapper}>
			<div className={cn(parsedEndDate && parsedEndDate < new Date() && styles.expired)}>
				{parsedDate ? parsedDate.toLocaleDateString() : 'N/A'}
			</div>
		</div>
	);
}
