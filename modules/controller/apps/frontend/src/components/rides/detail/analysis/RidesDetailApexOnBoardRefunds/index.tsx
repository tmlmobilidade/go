'use client';

/* * */

import { ApexCardTypeTag } from '@/components/common/ApexCardTypeTag';
import { ApexPaymentMethodTag } from '@/components/common/ApexPaymentMethodTag';
import { CurrencyTag } from '@/components/common/CurrencyTag';
import { TimestampTag } from '@/components/common/TimestampTag';
import { useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { type SimplifiedApexOnBoardRefund } from '@go/types';
import { Collapsible, DataTable, DataTableColumn, NoDataLabel, Section } from '@go/ui';
import { useMemo } from 'react';

/* * */

export function RidesDetailApexOnBoardRefunds() {
	//

	//
	// A. Setup variables

	const ridesDetailContext = useRidesDetailContext();

	const columns: DataTableColumn<SimplifiedApexOnBoardRefund>[] = [
		{
			accessor: 'created_at',
			render: item => <TimestampTag value={item.created_at} />,
			title: 'Timestamp',
			width: 280,
		},
		{
			accessor: 'stop_id',
			title: 'Stop ID',
			width: 100,
		},
		{
			accessor: 'card_serial_number',
			title: 'Card SN',
			width: 220,
		},
		{
			accessor: 'product_long_id',
			title: 'Product ID',
			width: 250,
		},
		{
			accessor: 'product_quantity',
			title: 'Qtd',
			width: 80,
		},
		{
			accessor: 'price',
			render: item => <CurrencyTag value={item.price} />,
			title: 'Price',
			width: 120,
		},
		{
			accessor: 'payment_method',
			render: item => <ApexPaymentMethodTag value={item.payment_method} />,
			title: 'Payment Method',
			width: 180,
		},
		{
			accessor: 'card_physical_type',
			render: item => <ApexCardTypeTag value={item.card_physical_type} />,
			title: 'Card Type',
			width: 220,
		},
		{
			accessor: 'validation_id',
			title: 'ID Validation',
			width: 400,
		},
		{
			accessor: 'on_board_sale_id',
			title: 'ID On Board Sale',
			width: 400,
		},
		{
			accessor: '_id',
			title: 'ID On Board Refund',
			width: 400,
		},
	];

	//
	// B. Transform data

	const sortedSimplifiedApexOnBoardRefunds = useMemo(() => {
		return ridesDetailContext.data.simplified_apex_on_board_refunds.sort((a, b) => a.created_at - b.created_at);
	}, [ridesDetailContext.data.simplified_apex_on_board_refunds]);

	//
	// C. Render components

	return (
		<Collapsible description="Reembolsos APEX associados a esta Ride." title="APEX On Board Refunds">
			{sortedSimplifiedApexOnBoardRefunds?.length > 0 ? (
				<DataTable
					columns={columns}
					records={sortedSimplifiedApexOnBoardRefunds}
					rowIdAccessor="_id"
				/>
			) : (
				<Section padding="md">
					<NoDataLabel text="Nenhum Reembolso Registado" />
				</Section>
			)}

		</Collapsible>
	);

	//
}
