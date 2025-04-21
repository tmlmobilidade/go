import { cn } from '@/lib/utils';
import { OperationalDate } from '@tmlmobilidade/types';
import { operationalDateToJsDate } from '@tmlmobilidade/utils';

import styles from './styles.module.css';

export default function DateCell({ date, endDate }: { date: OperationalDate, endDate: OperationalDate }) {
	//

	//
	// A. Setup variables
	const parsedDate = date ? operationalDateToJsDate(date) : null;
	const parsedEndDate = endDate ? operationalDateToJsDate(endDate) : null;
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
