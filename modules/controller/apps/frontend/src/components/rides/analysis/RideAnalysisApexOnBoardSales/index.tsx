'use client';

/* * */

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

	const { t } = useTranslation('controller', { keyPrefix: 'rides.analysis.onboardSales' });

	const columns: DataTableColumn<SimplifiedApexOnBoardSale>[] = [
		{
			accessor: 'created_at',
			render: item => <TimestampTag value={item.created_at} />,
			title: t('tableColumns.createdAt'),
			width: 280,
		},
		{
			accessor: 'stop_id',
			title: t('tableColumns.stopId'),
			width: 100,
		},
		{
			accessor: 'card_serial_number',
			title: t('tableColumns.cardSerialNumber'),
			width: 220,
		},
		{
			accessor: 'product_long_id',
			title: t('tableColumns.productId'),
			width: 250,
		},
		{
			accessor: 'product_quantity',
			title: t('tableColumns.productQuantity'),
			width: 80,
		},
		{
			accessor: 'price',
			render: item => <CurrencyTag value={item.price} />,
			title: t('tableColumns.price'),
			width: 120,
		},
		{
			accessor: 'payment_method',
			render: item => <ApexPaymentMethodTag value={item.payment_method} />,
			title: t('tableColumns.paymentMethod'),
			width: 180,
		},
		{
			accessor: 'card_physical_type',
			render: item => <ApexCardTypeTag value={item.card_physical_type} />,
			title: t('tableColumns.cardType'),
			width: 220,
		},
		{
			accessor: 'validation_id',
			title: t('tableColumns.idValidation'),
			width: 400,
		},
		{
			accessor: '_id',
			title: t('tableColumns.idOnBoardSale'),
			width: 400,
		},
		{
			accessor: 'on_board_refund_id',
			title: t('tableColumns.idOnBoardRefund'),
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
		<Collapsible description={t('description')} title={t('title')}>
			{sortedSimplifiedApexOnBoardSales?.length > 0 ? (
				<DataTable
					columns={columns}
					records={sortedSimplifiedApexOnBoardSales}
					rowIdAccessor="_id"
				/>
			) : (
				<Section padding="md">
					<NoDataLabel text={t('noData')} />
				</Section>
			)}
		</Collapsible>
	);

	//
}
