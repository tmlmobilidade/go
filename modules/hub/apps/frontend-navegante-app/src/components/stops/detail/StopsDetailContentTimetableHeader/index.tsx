/* * */

import { SelectOperationalDate } from '@/components/lines/common/SelectOperationalDate';
import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { useOperationalDateContext } from '@/contexts/OperationalDate.context';
import { getCssVariableValue } from '@/hooks/get-css-variabble';
import { useStickyObserver } from '@/hooks/use-sticky-observer';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function StopsDetailContentTimetableHeader() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const stopsDetailContext = useStopsDetailContext();
	const operationalDateContext = useOperationalDateContext();

	const headerHeight = getCssVariableValue('--size-height-header');
	const { isSticky, ref: stickyElementRef } = useStickyObserver({ top: headerHeight }, [1], { top: -1 });

	//
	// B. Render components

	if (!operationalDateContext.data.selected_date) {
		return null;
	}

	return (
		<div ref={stickyElementRef} className={`${styles.container} ${isSticky ? styles.isSticky : ''}`}>

			{!isSticky && (
				<SelectOperationalDate />
			)}

			{isSticky && (
				<>
					<p className={styles.stopSummaryWrapper}>
						{t('default:stops.StopsDetailContentTimetableHeader.summary', '', {
							changeDay: chunks => <a className={styles.changeDay} href="#">{chunks}</a>,
							day_name: operationalDateContext.data.selected_date.js_date,
							dayName: chunks => <span className={styles.dayName}>{chunks}</span>,
							stop_name: stopsDetailContext.data.stop?.name || '-',
							stopName: chunks => <span className={styles.stopName}>{chunks}</span>,
						})}
					</p>
				</>
			)}

			<div className={styles.tripsLegend}>
				<div className={styles.tripsLegendColumn}>{t('default:stops.StopsDetailContentTimetableHeader.trips_legend.line')}</div>
				<div className={styles.tripsLegendColumn}>{t('default:stops.StopsDetailContentTimetableHeader.trips_legend.headsign')}</div>
				<div className={styles.tripsLegendColumn}>{t('default:stops.StopsDetailContentTimetableHeader.trips_legend.estimate')}</div>
			</div>

		</div>
	);

	//
}
