'use client';

import { ApexCardTypeTag } from '@/components/common/ApexCardTypeTag';
import { ApexPaymentMethodTag } from '@/components/common/ApexPaymentMethodTag';
import { CurrencyTag } from '@/components/common/CurrencyTag';
import { TimestampTag } from '@/components/common/TimestampTag';
import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { type SimplifiedApexOnBoardRefund } from '@tmlmobilidade/go-types-apex';
import { Collapsible, DataTable, DataTableColumn, NoDataLabel, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAnalysisApexOnBoardRefunds() {
	//

	//
	// A. Setup variables

	const RideAnalysisContext = useRideAnalysisContext();
	const { t } = useTranslation();

	const columns: DataTableColumn<SimplifiedApexOnBoardRefund>[] = [
		{
			accessor: 'created_at',
			render: item => <TimestampTag value={item.created_at} />,
			title: t('default:rides.analysis.RideAnalysisApexOnBoardRefunds.Table.columns.created_at.label'),
			width: 280,
		},
		{
			accessor: 'stop_id',
			title: t('default:rides.analysis.RideAnalysisApexOnBoardRefunds.Table.columns.stop_id.label'),
			width: 100,
		},
		{
			accessor: 'card_serial_number',
			title: t('default:rides.analysis.RideAnalysisApexOnBoardRefunds.Table.columns.card_serial_number.label'),
			width: 220,
		},
		{
			accessor: 'product_long_id',
			title: t('default:rides.analysis.RideAnalysisApexOnBoardRefunds.Table.columns.product_id.label'),
			width: 250,
		},
		{
			accessor: 'product_quantity',
			title: t('default:rides.analysis.RideAnalysisApexOnBoardRefunds.Table.columns.product_quantity.label'),
			width: 80,
		},
		{
			accessor: 'price',
			render: item => <CurrencyTag value={item.price} />,
			title: t('default:rides.analysis.RideAnalysisApexOnBoardRefunds.Table.columns.price.label'),
			width: 120,
		},
		{
			accessor: 'payment_method',
			render: item => <ApexPaymentMethodTag value={item.payment_method} />,
			title: t('default:rides.analysis.RideAnalysisApexOnBoardRefunds.Table.columns.payment_method.label'),
			width: 180,
		},
		{
			accessor: 'card_physical_type',
			render: item => <ApexCardTypeTag value={item.card_physical_type} />,
			title: t('default:rides.analysis.RideAnalysisApexOnBoardRefunds.Table.columns.card_type.label'),
			width: 220,
		},
		{
			accessor: 'validation_id',
			title: t('default:rides.analysis.RideAnalysisApexOnBoardRefunds.Table.columns.id_validation.label'),
			width: 400,
		},
		{
			accessor: 'on_board_sale_id',
			title: t('default:rides.analysis.RideAnalysisApexOnBoardRefunds.Table.columns.id_on_board_sale.label'),
			width: 400,
		},
		{
			accessor: '_id',
			title: t('default:rides.analysis.RideAnalysisApexOnBoardRefunds.Table.columns.id_on_board_refund.label'),
			width: 400,
		},
	];

	//
	// B. Transform data

	const sortedSimplifiedApexOnBoardRefunds = useMemo(() => {
		return RideAnalysisContext.data.simplified_apex_on_board_refunds.sort((a, b) => a.created_at - b.created_at);
	}, [RideAnalysisContext.data.simplified_apex_on_board_refunds]);

	//
	// C. Render components

	return (
		<Collapsible description={t('default:rides.analysis.RideAnalysisApexOnBoardRefunds.description')} title={t('default:rides.analysis.RideAnalysisApexOnBoardRefunds.title')}>
			{sortedSimplifiedApexOnBoardRefunds?.length > 0 ? (
				<DataTable
					columns={columns}
					records={sortedSimplifiedApexOnBoardRefunds}
					rowIdAccessor="_id"
				/>
			) : (
				<Section padding="md">
					<NoDataLabel text={t('default:rides.analysis.RideAnalysisApexOnBoardRefunds.no_data')} />
				</Section>
			)}

		</Collapsible>
	);

	//
}
