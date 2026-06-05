/* * */

import { useOperationalDateContext } from '@/contexts/OperationalDate.context';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function StopsDetailContentTimetableHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const operationalDateContext = useOperationalDateContext();

	//
	// B. Render components

	if (!operationalDateContext.data.selected_date) {
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
