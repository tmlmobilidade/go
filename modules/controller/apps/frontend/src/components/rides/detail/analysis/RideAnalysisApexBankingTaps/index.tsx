'use client';

import { useRidesDetailApexBankingTapsData } from '@/components/rides/detail/shared/use-rides-detail-apex-banking-taps-data';
import { type SimplifiedApexBankingTap } from '@tmlmobilidade/go-types-apex';
import { Collapsible, DataTable, DataTableColumn, DataTableScroller, UnixTimestampDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAnalysisApexBankingTaps() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data: simplifiedApexBankingTapsData } = useRidesDetailApexBankingTapsData();

	const columns: DataTableColumn<SimplifiedApexBankingTap>[] = [
		{
			accessor: 'created_at',
			render: item => <UnixTimestampDisplay value={item.created_at} showDate />,
			title: t('default:rides.analysis.RideAnalysisApexBankingTaps.table.columns.created_at.label'),
			width: 280,
		},
		{
			accessor: 'event_type',
			title: t('default:rides.analysis.RideAnalysisApexBankingTaps.table.columns.event_type.label'),
			width: 100,
		},
		{
			accessor: 'stop_id',
			title: t('default:rides.analysis.RideAnalysisApexBankingTaps.table.columns.stop_id.label'),
			width: 100,
		},
		{
			accessor: 'card_serial_number',
			title: t('default:rides.analysis.RideAnalysisApexBankingTaps.table.columns.card_serial_number.label'),
			width: 220,
		},
		{
			accessor: 'product_id',
			title: t('default:rides.analysis.RideAnalysisApexBankingTaps.table.columns.product_id.label'),
			width: 450,
		},
		{
			accessor: 'vehicle_id',
			title: t('default:rides.analysis.RideAnalysisApexBankingTaps.table.columns.vehicle_id.label'),
			width: 120,
		},
		{
			accessor: 'mac_sam_serial_number',
			title: t('default:rides.analysis.RideAnalysisApexBankingTaps.table.columns.mac_sam_serial_number.label'),
			width: 160,
		},
		{
			accessor: '_id',
			title: t('default:rides.analysis.RideAnalysisApexBankingTaps.table.columns.id_validation.label'),
			width: 400,
		},
		{
			accessor: 'on_board_sale_id',
			title: t('default:rides.analysis.RideAnalysisApexBankingTaps.table.columns.id_on_board_sale.label'),
			width: 400,
		},
		{
			accessor: 'on_board_refund_id',
			title: t('default:rides.analysis.RideAnalysisApexBankingTaps.table.columns.id_on_board_refund.label'),
			width: 400,
		},
	];

	//
	// B. Transform data

	const sortedSimplifiedApexBankingTaps = useMemo(() => {
		if (!simplifiedApexBankingTapsData?.length) return [];
		return simplifiedApexBankingTapsData?.sort((a, b) => a.created_at - b.created_at);
	}, [simplifiedApexBankingTapsData]);

	//
	// C. Render components

	return (
		<Collapsible
			description={t('default:rides.analysis.RideAnalysisApexBankingTaps.description')}
			title={t('default:rides.analysis.RideAnalysisApexBankingTaps.title')}
		>
			<DataTableScroller>
				<DataTable
					columns={columns}
					records={sortedSimplifiedApexBankingTaps}
					rowIdAccessor="_id"
				/>
			</DataTableScroller>
		</Collapsible>
	);
}
