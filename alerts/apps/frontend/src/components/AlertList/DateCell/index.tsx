import { cn } from '@/lib/utils';
import { DateTime } from 'luxon';

import styles from './styles.module.css';

type DateType = Date | null | string | undefined;

export default function DateCell({ date, endDate }: { date: DateType, endDate: DateType }) {
	//

	//
	// A. Setup Variables
	const parsedDate = date ? DateTime.fromJSDate(new Date(date)) : null;
	const parsedEndDate = endDate ? DateTime.fromJSDate(new Date(endDate)) : null;
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
