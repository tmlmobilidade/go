'use client';

import { usePlanDetailContext } from '@/components/plans/detail/PlanDetailForm.context';
import { Collapsible, Section, ValueDisplay } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PlanDetailSectionStatistics() {
	//
	// A. Setup variables

	const { i18n, t } = useTranslation();
	const { data, flags } = usePlanDetailContext();
	const summary = data.plan?.summary;
	const locale = i18n.resolvedLanguage || 'pt-PT';
	const numberFormatter = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });

	//
	// B. Transform data

	const statusLabel = t(`plans:detail.PlanDetailSectionStatistics.status.${summary?.status ?? 'unavailable'}`);
	const tripCountLabel = summary?.trip_count != null ? numberFormatter.format(summary.trip_count) : statusLabel;

	//
	// C. Render components

	return (
		<Collapsible
			description={t('plans:detail.PlanDetailSectionStatistics.description')}
			title={t('plans:detail.PlanDetailSectionStatistics.title')}
			defaultOpen
		>
			<Section gap="sm">
				<ValueDisplay
					isLoading={flags.isLoading}
					label={t('plans:detail.PlanDetailSectionStatistics.trips')}
					value={tripCountLabel}
				/>
			</Section>
		</Collapsible>
	);
}
