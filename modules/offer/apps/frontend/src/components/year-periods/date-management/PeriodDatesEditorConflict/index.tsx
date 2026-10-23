'use client';

import { usePeriodDatesEditorContext } from '@/components/year-periods/date-management/PeriodDatesEditor.context';
import { PeriodsAssignmentReview } from '@/components/year-periods/shared/PeriodsAssignmentReview';

import styles from './styles.module.css';

/* * */

export function PeriodDatesEditorConflict() {
	//

	//
	// A. Setup variables

	const { assignmentReview, flags } = usePeriodDatesEditorContext();

	//
	// B. Render components

	return (
		<div className={styles.root}>
			<PeriodsAssignmentReview disabled={flags.is_saving} review={assignmentReview} />
		</div>
	);
}
