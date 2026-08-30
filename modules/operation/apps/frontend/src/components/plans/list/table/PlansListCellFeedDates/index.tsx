/* * */

import { IconArrowRight } from '@tabler/icons-react';
import { type OperationalDateInt, type TemporalStatus } from '@tmlmobilidade/go-types-shared';
import { Indicator, OperationalDateDisplay } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface PlansListCellFeedDatesProps {
	endDate: OperationalDateInt
	startDate: OperationalDateInt
	temporalStatus: TemporalStatus
}

/* * */

export function PlansListCellFeedDates({ endDate, startDate, temporalStatus }: PlansListCellFeedDatesProps) {
	return (
		<div className={styles.wrapper}>
			{temporalStatus === 'expired' && <Indicator variant="muted" />}
			{temporalStatus === 'active' && <Indicator variant="primary" filled />}
			{temporalStatus === 'upcoming' && <Indicator variant="primary" />}
			<OperationalDateDisplay value={startDate} />
			<IconArrowRight size={16} />
			<OperationalDateDisplay value={endDate} />
		</div>
	);
}
