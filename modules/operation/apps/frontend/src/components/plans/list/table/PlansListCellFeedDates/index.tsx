/* * */

import { IconAlertTriangle, IconArrowRight } from '@tabler/icons-react';
import { type OperationalDateInt, type TemporalStatus } from '@tmlmobilidade/go-types-shared';
import { Indicator, OperationalDateDisplay, Tooltip } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface PlansListCellFeedDatesProps {
	activeFrom: OperationalDateInt
	activeUntil: OperationalDateInt
	hasOverlap: boolean
	temporalStatus: TemporalStatus
}

/* * */

export function PlansListCellFeedDates({ activeFrom, activeUntil, hasOverlap, temporalStatus }: PlansListCellFeedDatesProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<div className={styles.wrapper}>

			{temporalStatus === 'expired' && <Indicator variant="muted" />}
			{temporalStatus === 'active' && <Indicator variant="primary" filled />}
			{temporalStatus === 'upcoming' && <Indicator variant="primary" />}

			<OperationalDateDisplay value={activeFrom} />
			<IconArrowRight className={styles.arrow} size={16} />
			<OperationalDateDisplay value={activeUntil} />

			{hasOverlap && (
				<Tooltip
					events={{ focus: true, hover: true, touch: true }}
					label={t('default:plans.list.PlansListCellFeedDates.has_overlap')}
				>
					<IconAlertTriangle className={styles.warning} size={24} />
				</Tooltip>
			)}

		</div>
	);
}
