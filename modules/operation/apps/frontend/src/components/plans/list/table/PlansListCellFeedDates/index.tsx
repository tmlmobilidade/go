/* * */

import { IconArrowRight } from '@tabler/icons-react';
import { type OperationalDateInt, type TemporalStatus } from '@tmlmobilidade/go-types-shared';
import { Indicator, OperationalDateDisplay } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface PlansListCellFeedDatesProps {
	activeFrom: OperationalDateInt
	activeUntil: OperationalDateInt
	temporalStatus: TemporalStatus
}

/* * */

export function PlansListCellFeedDates({ activeFrom, activeUntil, temporalStatus }: PlansListCellFeedDatesProps) {
	return (
		<div className={styles.wrapper}>
			{temporalStatus === 'expired' && <Indicator variant="muted" />}
			{temporalStatus === 'active' && <Indicator variant="primary" filled />}
			{temporalStatus === 'upcoming' && <Indicator variant="primary" />}
			<OperationalDateDisplay value={activeFrom} />
			<IconArrowRight size={16} />
			<OperationalDateDisplay value={activeUntil} />
		</div>
	);
}
