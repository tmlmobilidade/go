import { cn } from '@/lib/utils';
import { DateTime } from 'luxon';

import styles from './styles.module.css';

type DateType = number;

export default function DateCell({ date, endDate }: { date: DateType, endDate: DateType }) {
	//

	//
	// A. Setup variables
	const parsedDate = date ? DateTime.fromMillis(date) : null;
	const parsedEndDate = endDate ? DateTime.fromMillis(endDate) : null;
	//
	// B. Render
	return (
		<div className={styles.wrapper}>
			<div className={cn(parsedEndDate && parsedEndDate < DateTime.now() && styles.expired)}>
				{parsedDate ? parsedDate.toLocaleString(DateTime.DATETIME_MED) : 'N/A'}
			</div>
		</div>
	);
}
