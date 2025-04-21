import { cn } from '@/lib/utils';
import { OperationalDate } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';

import styles from './styles.module.css';

export default function DateCell({ date, endDate }: { date: OperationalDate, endDate: OperationalDate }) {
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
