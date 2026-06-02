'use client';

import { NoDataLabel } from '@/components/layout/NoDataLabel';
import { useLinesDetailContext } from '@/components/lines/detail/LinesDetail.context';
import { LinesDetailPathList } from '@/components/lines/detail/LinesDetailPathList';
// import { LinesDetailPathMap } from '@/components/lines/detail/LinesDetailPathMap';
import { useOperationalDateContext } from '@/contexts/OperationalDate.context';
import { getCssVariableValue } from '@/hooks/get-css-variabble';
import { useStickyObserver } from '@/hooks/use-sticky-observer';
import { Section, Surface } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function LinesDetailPath() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const linesDetailContext = useLinesDetailContext();
	const operationalDateContext = useOperationalDateContext();
	const headerHeight = getCssVariableValue('--size-height-header');
	const { isSticky, ref: stickyElementRef } = useStickyObserver({ top: headerHeight }, [1], { top: -1 });

	//
	// B. Render components

	if (!linesDetailContext.data.active_pattern || !operationalDateContext.data.selected_date) {
		return (
			<Surface>
				<NoDataLabel text={t('default:lines.LinesDetailPath.no_data')} withMinHeight />
			</Surface>
		);
	}

	return (
		<Surface>

			<div ref={stickyElementRef} className={`${styles.containerSummary} ${isSticky ? styles.isSticky : ''}`}>
				{isSticky && (
					<>
						<p className={styles.linesSummaryWrapper}>
							{t('default:lines.LinesDetailPath.summary', '', {
								changeDay: chunks => <a className={styles.changeDay} href="#">{chunks}</a>,
								day_name: operationalDateContext.data.selected_date.js_date,
								dayName: chunks => <span className={styles.dayName}>{chunks}</span>,
								destination_name: linesDetailContext.data.active_pattern?.headsign,
								destinationName: chunks => <span className={styles.destinationName}>{chunks}</span>,
								line_number: linesDetailContext.data.active_pattern?.line_id,
								lineNumber: chunks => <span className={styles.lineNumber}>{chunks}</span>,
							})}
						</p>
					</>
				)}
			</div>

			<Section>
				<div className={styles.container}>
					<LinesDetailPathList />
					<div className={styles.mapWrapper}>
						{/* <LinesDetailPathMap /> */}
					</div>
				</div>
			</Section>
		</Surface>
	);

	//
}
