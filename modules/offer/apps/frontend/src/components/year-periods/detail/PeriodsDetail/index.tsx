'use client';

import { PeriodDatesEditor } from '@/components/year-periods/date-management/PeriodDatesEditor';
import { PeriodDatesEditorSummary } from '@/components/year-periods/date-management/PeriodDatesEditorSummary';
import { Collapsible, ErrorDisplay, LoadingOverlay, Pane } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { PeriodsDetailBasicInfo } from '../PeriodsDetailBasicInfo';
import { PeriodsDetailHeader } from '../PeriodsDetailHeader';
import { usePeriodsDetailData } from '../use-periods-detail-data';

/* * */

export function PeriodsDetail() {
	//

	//
	// A. Setup variables

	const { data, error, isLoading } = usePeriodsDetailData();
	const { t } = useTranslation();

	//
	// B. Render components

	if (error) return <ErrorDisplay message={error} />;
	if (isLoading || !data) return <LoadingOverlay />;

	return (
		<Pane footer={[<PeriodDatesEditorSummary key="summary" />]} header={[<PeriodsDetailHeader key="header" />]}>
			<Collapsible description={data.code ? `${data.name} · ${data.code}` : data.name} title={t('default:periods.calendar.settings')}>
				<PeriodsDetailBasicInfo />
			</Collapsible>
			<PeriodDatesEditor />
		</Pane>
	);
}
