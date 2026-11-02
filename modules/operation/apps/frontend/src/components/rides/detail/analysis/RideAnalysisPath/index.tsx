'use client';

import { useRidesDetailApexBankingTapsData } from '@/components/rides/detail/shared/use-rides-detail-apex-banking-taps-data';
import { useRidesDetailApexRefundsData } from '@/components/rides/detail/shared/use-rides-detail-apex-refunds-data';
import { useRidesDetailApexSalesData } from '@/components/rides/detail/shared/use-rides-detail-apex-sales-data';
import { useRidesDetailApexValidationsData } from '@/components/rides/detail/shared/use-rides-detail-apex-validations-data';
import { useRidesDetailHashedTripData } from '@/components/rides/detail/shared/use-rides-detail-hashed-trip-data';
import { Collapsible, DataTable, DataTableColumn, DataTableScroller, IdTag, Label, NumberDisplay, Section, UnixMillisecondsDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getRideAnalysisPathData, type RideAnalysisPathRow } from './get-ride-analysis-path-data';

/* * */

export function RideAnalysisPath() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data: hashedTripData } = useRidesDetailHashedTripData();
	const { data: simplifiedApexBankingTapsData } = useRidesDetailApexBankingTapsData();
	const { data: simplifiedApexValidationsData } = useRidesDetailApexValidationsData();
	const { data: simplifiedApexSalesData } = useRidesDetailApexSalesData();
	const { data: simplifiedApexRefundsData } = useRidesDetailApexRefundsData();

	const columns: DataTableColumn<RideAnalysisPathRow>[] = [
		{
			accessor: 'stop_sequences',
			center: true,
			render: item => item.stop_sequences.map(sequence => `#${sequence}`).join(', ') || '—',
			title: t('default:rides.analysis.RideAnalysisPath.table.columns.stop_sequence.label'),
			width: 100,
		},
		{
			accessor: 'stop_name',
			render: item => (
				<Section alignItems="center" flexDirection="row" gap="md" padding="none">
					{item.stop_id && <IdTag id={item.stop_id} copyOnClick />}
					<Label>{item.stop_name ?? t(`default:rides.analysis.RideAnalysisPath.labels.${item.stop_id ? 'outside_route' : 'without_stop'}`)}</Label>
				</Section>
			),
			title: t('default:rides.analysis.RideAnalysisPath.table.columns.stop_name.label'),
			width: 500,
		},
		{
			accessor: 'passengers_observed',
			center: true,
			render: item => <NumberDisplay value={item.passengers_observed} />,
			title: t('default:rides.analysis.RideAnalysisPath.table.columns.passengers_observed.label'),
			width: 70,
		},
		{
			accessor: 'passengers_observed_subscription_qty',
			center: true,
			render: item => <NumberDisplay value={item.passengers_observed_subscription_qty} />,
			title: t('default:rides.analysis.RideAnalysisPath.table.columns.passengers_observed_subscription_qty.label'),
			width: 70,
		},
		{
			accessor: 'passengers_observed_banking_taps_qty',
			center: true,
			render: item => <NumberDisplay value={item.passengers_observed_banking_taps_qty} />,
			title: t('default:rides.analysis.RideAnalysisPath.table.columns.passengers_observed_banking_taps_qty.label'),
			width: 70,
		},
		{
			accessor: 'passengers_observed_prepaid',
			render: item => (
				<Section alignItems="center" flexDirection="row" gap="md" padding="none">
					<NumberDisplay value={item.passengers_observed_prepaid_qty} />
					<NumberDisplay prefix="€" value={item.passengers_observed_prepaid_amount / 100} />
				</Section>
			),
			title: t('default:rides.analysis.RideAnalysisPath.table.columns.passengers_observed_prepaid.label'),
			width: 120,
		},
		{
			accessor: 'passengers_observed_sales',
			render: item => (
				<Section alignItems="center" flexDirection="row" gap="md" padding="none">
					<NumberDisplay value={item.passengers_observed_sales_qty} />
					<NumberDisplay prefix="€" value={item.passengers_observed_sales_amount / 100} />
				</Section>
			),
			title: t('default:rides.analysis.RideAnalysisPath.table.columns.passengers_observed_sales.label'),
			width: 120,
		},
		{
			accessor: 'seen_at',
			render: item => (
				<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
					<UnixMillisecondsDisplay value={item.seen_first_at} />
					<UnixMillisecondsDisplay value={item.seen_last_at} />
				</Section>
			),
			title: t('default:rides.analysis.RideAnalysisPath.table.columns.seen_at.label'),
			width: 200,
		},
	];

	//
	// C. Transform data

	const tableData = useMemo(() => getRideAnalysisPathData({
		bankingTaps: simplifiedApexBankingTapsData ?? [],
		hashedTrip: hashedTripData ?? [],
		refunds: simplifiedApexRefundsData ?? [],
		sales: simplifiedApexSalesData ?? [],
		validations: simplifiedApexValidationsData ?? [],
	}), [hashedTripData, simplifiedApexBankingTapsData, simplifiedApexRefundsData, simplifiedApexSalesData, simplifiedApexValidationsData]);

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:rides.analysis.RideAnalysisPath.description')}
			title={t('default:rides.analysis.RideAnalysisPath.title')}
		>
			<DataTableScroller>
				<DataTable
					columns={columns}
					records={tableData}
					rowIdAccessor="row_id"
				/>
			</DataTableScroller>
		</Collapsible>
	);
}
