'use client';

/* * */

import { ApexValidationIsPassengerTag } from '@/components/common/ApexValidationIsPassengerTag';
import { ApexValidationStatusTag } from '@/components/common/ApexValidationStatusTag';
import { TimestampTag } from '@/components/common/TimestampTag';
import { useRidesDetailContext } from '@/contexts/RidesDetail.context';
import { type SimplifiedApexValidation } from '@tmlmobilidade/go-types';
import { Collapsible, DataTable, DataTableColumn, NoDataLabel, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

export function RidesDetailApexValidations() {
	//

	//
	// A. Setup variables

	const ridesDetailContext = useRidesDetailContext();

	const columns: DataTableColumn<SimplifiedApexValidation>[] = [
		{
			accessor: 'created_at',
			render: item => <TimestampTag value={item.created_at} />,
			title: 'Timestamp',
			width: 280,
		},
		{
			accessor: 'event_type',
			title: 'Event Type',
			width: 100,
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
			accessor: 'product_id',
			title: 'Product ID',
			width: 450,
		},
		{
			accessor: 'validation_status',
			render: item => <ApexValidationStatusTag value={item.validation_status} />,
			title: 'Status',
			width: 250,
		},
		{
			accessor: 'is_passenger',
			render: item => <ApexValidationIsPassengerTag value={item.is_passenger} />,
			title: 'Tx Valid',
			width: 150,
		},
		{
			accessor: 'vehicle_id',
			title: 'Vehicle ID',
			width: 120,
		},
		{
			accessor: 'mac_sam_serial_number',
			title: 'SAM SN',
			width: 160,
		},
		{
			accessor: '_id',
			title: 'ID Validation',
			width: 400,
		},
		{
			accessor: 'on_board_sale_id',
			title: 'ID On Board Sale',
			width: 400,
		},
		{
			accessor: 'on_board_refund_id',
			title: 'ID On Board Refund',
			width: 400,
		},
	];

	//
	// B. Transform data

	const sortedSimplifiedApexValidations = useMemo(() => {
		return ridesDetailContext.data.simplified_apex_validations.sort((a, b) => a.created_at - b.created_at);
	}, [ridesDetailContext.data.simplified_apex_validations]);

	//
	// C. Render components

	return (
		<Collapsible description="Validações APEX associadas a esta Ride." title="APEX Validations">
			{sortedSimplifiedApexValidations.length > 0 ? (
				<DataTable
					columns={columns}
					records={sortedSimplifiedApexValidations}
					rowIdAccessor="_id"
				/>
			) : (
				<Section padding="md">
					<NoDataLabel text="Nenhuma Validação Registada" />
				</Section>
			)}
		</Collapsible>
	);

	//
}
