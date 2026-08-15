'use client';

import { useRidesDetailApexBankingTapsData } from '@/components/rides/detail/shared/use-rides-detail-apex-banking-taps-data';
import { useRidesDetailApexRefundsData } from '@/components/rides/detail/shared/use-rides-detail-apex-refunds-data';
import { useRidesDetailApexSalesData } from '@/components/rides/detail/shared/use-rides-detail-apex-sales-data';
import { useRidesDetailApexValidationsData } from '@/components/rides/detail/shared/use-rides-detail-apex-validations-data';
import { useRidesDetailHashedTripData } from '@/components/rides/detail/shared/use-rides-detail-hashed-trip-data';
import { type SimplifiedApexBankingTap, type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale, type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { Collapsible, DataTable, DataTableColumn, IdTag, Label, ScrollArea, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface TableData {
	passengers_observed: number
	passengers_observed_banking_taps_qty: number
	passengers_observed_prepaid_amount: number
	passengers_observed_prepaid_qty: number
	passengers_observed_sales_amount: number
	passengers_observed_sales_qty: number
	passengers_observed_subscription_qty: number
	seen_first_at: UnixTimestamp
	seen_last_at: UnixTimestamp
	stop_id: string
	stop_name: string
	stop_sequence: number
}

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

	const columns: DataTableColumn<TableData>[] = [
		{
			accessor: 'stop_sequence',
			center: true,
			render: item => <IdTag id={`#${item.stop_sequence}`} />,
			title: t('default:rides.analysis.RideAnalysisPath.table.columns.stop_sequence.label'),
			width: 50,
		},
		{
			accessor: 'stop_name',
			render: item => (
				<Section alignItems="center" flexDirection="row" gap="md" padding="none">
					<IdTag id={item.stop_id} copyOnClick />
					<Label>{item.stop_name}</Label>
				</Section>
			),
			title: t('default:rides.analysis.RideAnalysisPath.table.columns.stop_name.label'),
			width: 400,
		},
		{
			accessor: 'passengers_observed',
			center: true,
			render: item => !!item.passengers_observed && item.passengers_observed,
			title: t('default:rides.analysis.RideAnalysisPath.table.columns.passengers_observed.label'),
			width: 100,
		},
		{
			accessor: 'passengers_observed_banking_taps_qty',
			center: true,
			render: item => !!item.passengers_observed_banking_taps_qty && item.passengers_observed_banking_taps_qty,
			title: t('default:rides.analysis.RideAnalysisPath.table.columns.passengers_observed_banking_taps_qty.label'),
			width: 100,
		},
		{
			accessor: 'passengers_observed_prepaid_amount',
			center: true,
			render: item => !!item.passengers_observed_prepaid_amount && item.passengers_observed_prepaid_amount,
			title: t('default:rides.analysis.RideAnalysisPath.table.columns.passengers_observed_prepaid_amount.label'),
			width: 100,
		},
		{
			accessor: 'passengers_observed_prepaid_qty',
			center: true,
			render: item => !!item.passengers_observed_prepaid_qty && item.passengers_observed_prepaid_qty,
			title: t('default:rides.analysis.RideAnalysisPath.table.columns.passengers_observed_prepaid_qty.label'),
			width: 100,
		},
		{
			accessor: 'passengers_observed_sales_amount',
			center: true,
			render: item => !!item.passengers_observed_sales_amount && item.passengers_observed_sales_amount,
			title: t('default:rides.analysis.RideAnalysisPath.table.columns.passengers_observed_sales_amount.label'),
			width: 100,
		},
		{
			accessor: 'passengers_observed_sales_qty',
			center: true,
			render: item => !!item.passengers_observed_sales_qty && item.passengers_observed_sales_qty,
			title: t('default:rides.analysis.RideAnalysisPath.table.columns.passengers_observed_sales_qty.label'),
			width: 100,
		},
		{
			accessor: 'passengers_observed_subscription_qty',
			center: true,
			render: item => !!item.passengers_observed_subscription_qty && item.passengers_observed_subscription_qty,
			title: t('default:rides.analysis.RideAnalysisPath.table.columns.passengers_observed_subscription_qty.label'),
			width: 100,
		},
		{
			accessor: 'seen_first_at',
			center: true,
			render: item => !!item.seen_first_at && item.seen_first_at,
			title: t('default:rides.analysis.RideAnalysisPath.table.columns.seen_first_at.label'),
			width: 100,
		},
		{
			accessor: 'seen_last_at',
			center: true,
			render: item => !!item.seen_last_at && item.seen_last_at,
			title: t('default:rides.analysis.RideAnalysisPath.table.columns.seen_last_at.label'),
			width: 100,
		},
	];

	//
	// C. Transform data

	const validationsByStopId: Record<string, SimplifiedApexValidation[]> = useMemo(() => {
		if (!simplifiedApexValidationsData) return {};
		return simplifiedApexValidationsData
			.filter(validation => validation.is_passenger)
			.reduce((acc, validation) => {
				if (!validation.stop_id) return acc;
				acc[validation.stop_id] = (acc[validation.stop_id] || []).concat(validation);
				return acc;
			}, {});
	}, [simplifiedApexValidationsData]);

	const bankingTapsByStopId: Record<string, SimplifiedApexBankingTap[]> = useMemo(() => {
		if (!simplifiedApexBankingTapsData) return {};
		return simplifiedApexBankingTapsData.reduce((acc, bankingTap) => {
			if (!bankingTap.stop_id) return acc;
			acc[bankingTap.stop_id] = (acc[bankingTap.stop_id] || []).concat(bankingTap);
			return acc;
		}, {});
	}, [simplifiedApexBankingTapsData]);

	const salesByStopId: Record<string, SimplifiedApexOnBoardSale[]> = useMemo(() => {
		if (!simplifiedApexSalesData) return {};
		return simplifiedApexSalesData.reduce((acc, sale) => {
			if (!sale.stop_id) return acc;
			acc[sale.stop_id] = (acc[sale.stop_id] || []).concat(sale);
			return acc;
		}, {});
	}, [simplifiedApexSalesData]);

	const refundsByStopId: Record<string, SimplifiedApexOnBoardRefund[]> = useMemo(() => {
		if (!simplifiedApexRefundsData) return {};
		return simplifiedApexRefundsData.reduce((acc, refund) => {
			if (!refund.stop_id) return acc;
			acc[refund.stop_id] = (acc[refund.stop_id] || []).concat(refund);
			return acc;
		}, {});
	}, [simplifiedApexRefundsData]);

	const tableData: TableData[] = useMemo(() => {
		// Skip if no hashed trip data
		if (!hashedTripData) return [];
		// From the hashed trip data calculate required data
		return hashedTripData
			.sort((a, b) => a.stop_sequence - b.stop_sequence)
			.map((item) => {
				// Get oldest and latest timestamp of all APEX transactions
				const seenFirstAt = Math.min(...[
					...(validationsByStopId[item.stop_id]?.map(validation => validation.created_at) || []),
					...(bankingTapsByStopId[item.stop_id]?.map(bankingTap => bankingTap.created_at) || []),
					...(salesByStopId[item.stop_id]?.map(sale => sale.created_at) || []),
					...(refundsByStopId[item.stop_id]?.map(refund => refund.created_at) || []),
				]) as UnixTimestamp;
				const seenLastAt = Math.max(...[
					...(validationsByStopId[item.stop_id]?.map(validation => validation.created_at) || []),
					...(bankingTapsByStopId[item.stop_id]?.map(bankingTap => bankingTap.created_at) || []),
					...(salesByStopId[item.stop_id]?.map(sale => sale.created_at) || []),
					...(refundsByStopId[item.stop_id]?.map(refund => refund.created_at) || []),
				]) as UnixTimestamp;
				// Return the data
				return {
					passengers_observed: validationsByStopId[item.stop_id]?.filter(validation => validation.is_passenger).length || 0,
					passengers_observed_banking_taps_qty: bankingTapsByStopId[item.stop_id]?.length || 0,
					passengers_observed_prepaid_amount: validationsByStopId[item.stop_id]?.filter(validation => validation.category === 'prepaid' && validation.is_passenger).reduce((acc, validation) => acc + validation.units_qty, 0) || 0,
					passengers_observed_prepaid_qty: validationsByStopId[item.stop_id]?.filter(validation => validation.category === 'prepaid' && validation.is_passenger).length || 0,
					passengers_observed_sales_amount: salesByStopId[item.stop_id]?.filter(sale => sale.is_passenger).reduce((acc, sale) => acc + (sale.price * sale.product_quantity), 0) || 0,
					passengers_observed_sales_qty: validationsByStopId[item.stop_id]?.filter(validation => validation.category === 'on_board_sale' && validation.is_passenger).length || 0,
					passengers_observed_subscription_qty: validationsByStopId[item.stop_id]?.filter(validation => validation.category === 'subscription' && validation.is_passenger).length || 0,
					seen_first_at: seenFirstAt,
					seen_last_at: seenLastAt,
					stop_id: item.stop_id,
					stop_name: item.stop_name,
					stop_sequence: item.stop_sequence,
				} satisfies TableData;
			});
	}, [bankingTapsByStopId, hashedTripData, refundsByStopId, salesByStopId, validationsByStopId]);

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:rides.analysis.RideAnalysisPath.description')}
			title={t('default:rides.analysis.RideAnalysisPath.title')}
			defaultOpen
		>
			<ScrollArea>
				<DataTable
					columns={columns}
					records={tableData}
					rowIdAccessor="stop_id"
				/>
			</ScrollArea>
		</Collapsible>
	);
}
