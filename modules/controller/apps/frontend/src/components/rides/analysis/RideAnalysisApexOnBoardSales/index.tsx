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

	const { t } = useTranslation('controller', { keyPrefix: 'rides.analysis.onboard_sales' });

	const columns: DataTableColumn<SimplifiedApexOnBoardSale>[] = [
		{
			accessor: 'created_at',
			render: item => <TimestampTag value={item.created_at} />,
			title: t('table_columns.created_at'),
			width: 280,
		},
		{
			accessor: 'stop_id',
			title: t('table_columns.stop_id'),
			width: 100,
		},
		{
			accessor: 'card_serial_number',
			title: t('table_columns.card_serial_number'),
			width: 220,
		},
		{
			accessor: 'product_long_id',
			title: t('table_columns.product_id'),
			width: 250,
		},
		{
			accessor: 'product_quantity',
			title: t('table_columns.product_quantity'),
			width: 80,
		},
		{
			accessor: 'price',
			render: item => <CurrencyTag value={item.price} />,
			title: t('table_columns.price'),
			width: 120,
		},
		{
			accessor: 'payment_method',
			render: item => <ApexPaymentMethodTag value={item.payment_method} />,
			title: t('table_columns.payment_method'),
			width: 180,
		},
		{
			accessor: 'card_physical_type',
			render: item => <ApexCardTypeTag value={item.card_physical_type} />,
			title: t('table_columns.card_type'),
			width: 220,
		},
		{
			accessor: 'validation_id',
			title: t('table_columns.id_validation'),
			width: 400,
		},
		{
			accessor: '_id',
			title: t('table_columns.id_on_board_sale'),
			width: 400,
		},
		{
			accessor: 'on_board_refund_id',
			title: t('table_columns.id_on_board_refund'),
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
					<NoDataLabel text={t('no_data')} />
				</Section>
			)}
		</Collapsible>
	);

	//
}
