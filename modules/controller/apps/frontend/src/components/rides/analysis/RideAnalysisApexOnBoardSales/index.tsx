'use client';

import { ApexCardTypeTag } from '@/components/common/ApexCardTypeTag';
import { ApexPaymentMethodTag } from '@/components/common/ApexPaymentMethodTag';
import { CurrencyTag } from '@/components/common/CurrencyTag';
import { TimestampTag } from '@/components/common/TimestampTag';
import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { type SimplifiedApexOnBoardSale } from '@tmlmobilidade/types';
import { Collapsible, DataTable, DataTableColumn, NoDataLabel, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAnalysisApexOnBoardSales() {
	//

	//
	// A. Setup variables

	const RideAnalysisContext = useRideAnalysisContext();
	const { t } = useTranslation();

	const columns: DataTableColumn<SimplifiedApexOnBoardSale>[] = [
		{
			accessor: 'created_at',
			render: item => <TimestampTag value={item.created_at} />,
		title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.Table.columns.created_at.label'),
		width: 280,
	},
	{
		accessor: 'stop_id',
		title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.Table.columns.stop_id.label'),
		width: 100,
	},
	{
		accessor: 'card_serial_number',
		title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.Table.columns.card_serial_number.label'),
		width: 220,
	},
	{
		accessor: 'product_long_id',
		title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.Table.columns.product_id.label'),
		width: 250,
	},
	{
		accessor: 'product_quantity',
		title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.Table.columns.product_quantity.label'),
		width: 80,
	},
	{
		accessor: 'price',
		render: item => <CurrencyTag value={item.price} />,
		title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.Table.columns.price.label'),
		width: 120,
	},
	{
		accessor: 'payment_method',
		render: item => <ApexPaymentMethodTag value={item.payment_method} />,
		title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.Table.columns.payment_method.label'),
		width: 180,
	},
	{
		accessor: 'card_physical_type',
		render: item => <ApexCardTypeTag value={item.card_physical_type} />,
		title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.Table.columns.card_type.label'),
		width: 220,
	},
	{
		accessor: 'validation_id',
		title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.Table.columns.id_validation.label'),
		width: 400,
	},
	{
		accessor: '_id',
		title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.Table.columns.id_on_board_sale.label'),
		width: 400,
	},
	{
		accessor: 'on_board_refund_id',
		title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.Table.columns.id_on_board_refund.label'),
		width: 400,
	},
];

//
// B. Transform data

const sortedSimplifiedApexOnBoardSales = useMemo(() => {
	return RideAnalysisContext.data.simplified_apex_on_board_sales.sort((a, b) => a.created_at - b.created_at);
}, [RideAnalysisContext.data.simplified_apex_on_board_sales]);

//
// C. Render components

return (
	<Collapsible description={t('default:rides.analysis.RideAnalysisApexOnBoardSales.description')} title={t('default:rides.analysis.RideAnalysisApexOnBoardSales.title')}>
		{sortedSimplifiedApexOnBoardSales?.length > 0 ? (
			<DataTable
				columns={columns}
				records={sortedSimplifiedApexOnBoardSales}
				rowIdAccessor="_id"
			/>
		) : (
			<Section padding="md">
				<NoDataLabel text={t('default:rides.analysis.RideAnalysisApexOnBoardSales.no_data')} />
				</Section>
			)}
		</Collapsible>
	);

	//
}
