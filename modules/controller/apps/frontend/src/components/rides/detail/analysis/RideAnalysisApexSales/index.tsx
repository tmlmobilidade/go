'use client';

import { ApexCardTypeTag } from '@/components/common/ApexCardTypeTag';
import { ApexPaymentMethodTag } from '@/components/common/ApexPaymentMethodTag';
import { CurrencyTag } from '@/components/common/CurrencyTag';
import { useRidesDetailApexSalesData } from '@/components/rides/detail/shared/use-rides-detail-apex-sales-data';
import { type SimplifiedApexOnBoardSale } from '@tmlmobilidade/go-types-apex';
import { Collapsible, DataTable, DataTableColumn, UnixTimestampDisplay } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAnalysisApexSales() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data: simplifiedApexSalesData } = useRidesDetailApexSalesData();

	const columns: DataTableColumn<SimplifiedApexOnBoardSale>[] = [
		{
			accessor: 'created_at',
			render: item => <UnixTimestampDisplay value={item.created_at} showDate />,
			title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.table.columns.created_at.label'),
			width: 280,
		},
		{
			accessor: 'stop_id',
			title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.table.columns.stop_id.label'),
			width: 100,
		},
		{
			accessor: 'card_serial_number',
			title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.table.columns.card_serial_number.label'),
			width: 220,
		},
		{
			accessor: 'product_id',
			title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.table.columns.product_id.label'),
			width: 250,
		},
		{
			accessor: 'product_quantity',
			title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.table.columns.product_quantity.label'),
			width: 80,
		},
		{
			accessor: 'price',
			render: item => <CurrencyTag value={item.price} />,
			title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.table.columns.price.label'),
			width: 120,
		},
		{
			accessor: 'payment_method',
			render: item => <ApexPaymentMethodTag value={item.payment_method} />,
			title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.table.columns.payment_method.label'),
			width: 180,
		},
		{
			accessor: 'card_physical_type',
			render: item => <ApexCardTypeTag value={item.card_physical_type} />,
			title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.table.columns.card_type.label'),
			width: 220,
		},
		{
			accessor: 'validation_id',
			title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.table.columns.id_validation.label'),
			width: 400,
		},
		{
			accessor: '_id',
			title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.table.columns.id_on_board_sale.label'),
			width: 400,
		},
		{
			accessor: 'on_board_refund_id',
			title: t('default:rides.analysis.RideAnalysisApexOnBoardSales.table.columns.id_on_board_refund.label'),
			width: 400,
		},
	];

	//
	// B. Transform data

	const sortedSimplifiedApexOnBoardSales = useMemo(() => {
		if (!simplifiedApexSalesData?.length) return [];
		return simplifiedApexSalesData.sort((a, b) => a.created_at - b.created_at);
	}, [simplifiedApexSalesData]);

	//
	// C. Render components

	return (
		<Collapsible description={t('default:rides.analysis.RideAnalysisApexOnBoardSales.description')} title={t('default:rides.analysis.RideAnalysisApexOnBoardSales.title')}>
			<DataTable
				columns={columns}
				records={sortedSimplifiedApexOnBoardSales}
				rowIdAccessor="_id"
			/>
		</Collapsible>
	);
}
