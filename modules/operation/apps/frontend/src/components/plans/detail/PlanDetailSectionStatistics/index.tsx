'use client';

import { usePlanDetailContext } from '@/components/plans/detail/PlanDetailForm.context';
import { Collapsible, ErrorDisplay, Grid, NoDataLabel, ProcessingStatusDisplay, Section, ValueDisplay } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PlanDetailSectionStatistics() {
	//

	//
	// A. Setup variables

	const { data: { plan } } = usePlanDetailContext();
	const { i18n, t } = useTranslation();

	//
	// B. Prepare persisted results for display

	const app = plan?.apps.plans_statistics;
	const isOutdated = app?.status === 'complete' && app.last_hash !== plan?.hash;
	const status = isOutdated ? 'waiting' : app?.status ?? 'waiting';
	const statistics = status === 'complete' ? app?.statistics : null;
	const isProcessing = status === 'processing';
	const cost = statistics?.plan_cost;

	const numberFormatter = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 0 });
	const distanceFormatter = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2, minimumFractionDigits: 2, style: 'unit', unit: 'kilometer' });
	const currencyFormatter = new Intl.NumberFormat(i18n.language, { currency: 'EUR', style: 'currency' });
	const costValue = cost?.status === 'ready'
		? currencyFormatter.format(cost.amount)
		: t(`plans:detail.PlanDetailSectionStatistics.cost.${cost?.status ?? 'unavailable'}`);

	//
	// C. Render components

	return (
		<Collapsible
			description={t('plans:detail.PlanDetailSectionStatistics.description')}
			title={t('plans:detail.PlanDetailSectionStatistics.title')}
			defaultOpen
		>
			<Section gap="sm">
				<ProcessingStatusDisplay value={status} />

				{status === 'error' && (
					<ErrorDisplay message={t('plans:detail.PlanDetailSectionStatistics.error')} />
				)}

				{(statistics || isProcessing) && (
					<Grid columns="ab" gap="sm">
						<ValueDisplay
							footer={t('plans:detail.PlanDetailSectionStatistics.fields.vkms.description')}
							isLoading={isProcessing}
							label={t('plans:detail.PlanDetailSectionStatistics.fields.vkms.label')}
							value={statistics ? distanceFormatter.format(statistics.vkm_count) : null}
						/>
						<ValueDisplay
							footer={t('plans:detail.PlanDetailSectionStatistics.fields.lines.description')}
							isLoading={isProcessing}
							label={t('plans:detail.PlanDetailSectionStatistics.fields.lines.label')}
							value={statistics ? numberFormatter.format(statistics.line_count) : null}
						/>
						<ValueDisplay
							footer={t('plans:detail.PlanDetailSectionStatistics.fields.trips.description')}
							isLoading={isProcessing}
							label={t('plans:detail.PlanDetailSectionStatistics.fields.trips.label')}
							value={statistics ? numberFormatter.format(statistics.trip_count) : null}
						/>
						<ValueDisplay
							isLoading={isProcessing}
							label={t('plans:detail.PlanDetailSectionStatistics.fields.cost.label')}
							value={costValue}
						/>
					</Grid>
				)}

				{status !== 'error' && !statistics && !isProcessing && (
					<NoDataLabel text={t(`plans:detail.PlanDetailSectionStatistics.${isOutdated ? 'outdated' : 'unavailable'}`)} />
				)}
			</Section>
		</Collapsible>
	);
}
