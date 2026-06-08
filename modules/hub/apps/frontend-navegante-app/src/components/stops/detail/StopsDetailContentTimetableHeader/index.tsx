/* * */

import { useOperationalDate } from '@/components/common/operational-date/use-operational-date';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function StopsDetailContentTimetableHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const operationalDate = useOperationalDate();

	//
	// B. Render components

	if (!operationalDate.selectedOperationalDate) {
		return null;
	}

	return (
		<div className={styles.container}>

			<div className={styles.tripsLegend}>
				<div className={styles.tripsLegendColumn}>{t('default:stops.StopsDetailContentTimetableHeader.trips_legend.line')}</div>
				<div className={styles.tripsLegendColumn}>{t('default:stops.StopsDetailContentTimetableHeader.trips_legend.headsign')}</div>
				<div className={styles.tripsLegendColumn}>{t('default:stops.StopsDetailContentTimetableHeader.trips_legend.estimate')}</div>
			</div>

		</div>
	);

	//
}
