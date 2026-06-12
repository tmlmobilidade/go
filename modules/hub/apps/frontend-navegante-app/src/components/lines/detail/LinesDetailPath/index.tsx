'use client';

import { NoDataLabel } from '@/components/common/display/NoDataLabel';
import { useOperationalDate } from '@/components/common/operational-date/use-operational-date';
import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { LinesDetailPathList } from '@/components/lines/detail/LinesDetailPathList';
import { Surface } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function LinesDetailPath() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const linesDetailContext = useLinesDetailContext();
	const operationalDate = useOperationalDate();

	//
	// B. Render components

	if (!linesDetailContext.data.active_pattern || !operationalDate.selectedOperationalDate) {
		return (
			<Surface>
				<NoDataLabel text={t('default:lines.LinesDetailPath.no_data')} />
			</Surface>
		);
	}

	return (
		<Surface>

			<div className={styles.containerSummary}>
				{/* <p className={styles.linesSummaryWrapper}>
					{t('default:lines.LinesDetailPath.summary', '', {
						changeDay: chunks => <a className={styles.changeDay} href="#">{chunks}</a>,
						day_name: operationalDateContext.data.selected_date.js_date,
						dayName: chunks => <span className={styles.dayName}>{chunks}</span>,
						destination_name: linesDetailContext.data.active_pattern?.headsign,
						destinationName: chunks => <span className={styles.destinationName}>{chunks}</span>,
						line_number: linesDetailContext.data.active_pattern?.line_id,
						lineNumber: chunks => <span className={styles.lineNumber}>{chunks}</span>,
					})}
				</p> */}
			</div>

			<LinesDetailPathList />

		</Surface>
	);

	//
}
