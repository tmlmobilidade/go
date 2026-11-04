'use client';

import { usePlanDetailContext } from '@/components/plans/detail/PlanDetailForm.context';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Collapsible, Grid, Section, ValueDisplay } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PlanDetailSectionStatistics() {
	//
	// A. Setup variables

	const { i18n, t } = useTranslation();
	const { data, flags } = usePlanDetailContext();
	const plan = data.plan;
	const summary = plan?.summary;
	const locale = i18n.resolvedLanguage || 'pt-PT';
	const numberFormatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
	const currencyFormatter = new Intl.NumberFormat(locale, { currency: 'EUR', style: 'currency' });

	//
	// B. Transform data

	const unavailable = t(`plans:detail.PlanDetailSectionStatistics.status.${summary?.status ?? 'unavailable'}`);
	const costStatus = t(`plans:detail.PlanDetailSectionStatistics.cost_status.${summary?.cost_status ?? 'statistics_unavailable'}`);
	const start = plan ? Dates.fromOperationalDateInt(plan.active_from, 'Europe/Lisbon').toFormat('dd/LL/yyyy') : '';
	const end = plan ? Dates.fromOperationalDateInt(plan.active_until, 'Europe/Lisbon').toFormat('dd/LL/yyyy') : '';

	//
	// C. Render components

	return (
		<Collapsible
			description={`${t('plans:detail.PlanDetailSectionStatistics.description')} ${start} – ${end}`}
			title={t('plans:detail.PlanDetailSectionStatistics.title')}
			defaultOpen
		>
			<Section gap="sm">
				<Grid columns="ab" gap="sm">
					<ValueDisplay
						isLoading={flags.isLoading}
						label={t('plans:detail.PlanDetailSectionStatistics.kilometers')}
						value={summary?.kilometers != null ? `${numberFormatter.format(summary.kilometers)} km` : unavailable}
					/>
					<ValueDisplay
						isLoading={flags.isLoading}
						label={t('plans:detail.PlanDetailSectionStatistics.lines')}
						value={summary?.line_count != null ? numberFormatter.format(summary.line_count) : unavailable}
					/>
					<ValueDisplay
						isLoading={flags.isLoading}
						label={t('plans:detail.PlanDetailSectionStatistics.trips')}
						value={summary?.trip_count != null ? numberFormatter.format(summary.trip_count) : unavailable}
					/>
					<ValueDisplay
						isLoading={flags.isLoading}
						label={t('plans:detail.PlanDetailSectionStatistics.estimated_cost')}
						value={summary?.estimated_cost != null ? currencyFormatter.format(summary.estimated_cost) : costStatus}
						footer={summary?.price_per_km != null
							? `${t('plans:detail.PlanDetailSectionStatistics.rate')}: ${new Intl.NumberFormat(locale, { maximumFractionDigits: 20 }).format(summary.price_per_km)} €/km`
							: undefined}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
