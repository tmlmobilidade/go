/* * */

import { type PlanNormalized } from '@/types/normalized';
import { IconArrowRight } from '@tabler/icons-react';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { Indicator, OperationalDateDisplay } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface PlansListCellFeedDatesProps {
	endDate: OperationalDateInt
	startDate: OperationalDateInt
	validityStatus: PlanNormalized['validity_status']
}

/* * */

export function PlansListCellFeedDates({ endDate, startDate, validityStatus }: PlansListCellFeedDatesProps) {
	return (
		<div className={styles.wrapper}>
			{validityStatus === 'expired' && <Indicator variant="muted" />}
			{validityStatus === 'active' && <Indicator variant="primary" filled />}
			{validityStatus === 'upcoming' && <Indicator variant="primary" />}
			<OperationalDateDisplay value={startDate} />
			<IconArrowRight size={16} />
			<OperationalDateDisplay value={endDate} />
		</div>
	);
}
