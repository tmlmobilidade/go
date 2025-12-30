'use client';

/* * */

import { ApexValidationIsPassengerTag } from '@/components/common/ApexValidationIsPassengerTag';
import { ApexValidationStatusTag } from '@/components/common/ApexValidationStatusTag';
import { TimestampTag } from '@/components/common/TimestampTag';
import { useRideAnalysisContext } from '@/contexts/RideAnalysis.context';
import { type SimplifiedApexValidation } from '@tmlmobilidade/types';
import { Collapsible, DataTable, DataTableColumn, NoDataLabel, Section } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

export function RideAnalysisApexValidations() {
	//

	//
	// A. Setup variables

	const RideAnalysisContext = useRideAnalysisContext();

	const { t } = useTranslation('controller', { keyPrefix: 'rides.analysis.validations' });

	const columns: DataTableColumn<SimplifiedApexValidation>[] = [
		{
			accessor: 'created_at',
			render: item => <TimestampTag value={item.created_at} />,
			title: t('tableColumns.createdAt'),
			width: 280,
		},
		{
			accessor: 'event_type',
			title: t('tableColumns.eventType'),
			width: 100,
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
			accessor: 'product_id',
			title: t('tableColumns.productId'),
			width: 450,
		},
		{
			accessor: 'validation_status',
			render: item => <ApexValidationStatusTag value={item.validation_status} />,
			title: t('tableColumns.status'),
			width: 250,
		},
		{
			accessor: 'is_passenger',
			render: item => <ApexValidationIsPassengerTag value={item.is_passenger} />,
			title: t('tableColumns.txValid'),
			width: 150,
		},
		{
			accessor: 'vehicle_id',
			title: t('tableColumns.vehicleId'),
			width: 120,
		},
		{
			accessor: 'mac_sam_serial_number',
			title: t('tableColumns.macSamSerialNumber'),
			width: 160,
		},
		{
			accessor: '_id',
			title: t('tableColumns.idValidation'),
			width: 400,
		},
		{
			accessor: 'on_board_sale_id',
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

	const sortedSimplifiedApexValidations = useMemo(() => {
		return RideAnalysisContext.data.simplified_apex_validations.sort((a, b) => a.created_at - b.created_at);
	}, [RideAnalysisContext.data.simplified_apex_validations]);

	//
	// C. Render components

	return (
		<Collapsible description={t('description')} title={t('title')}>
			{sortedSimplifiedApexValidations.length > 0 ? (
				<DataTable
					columns={columns}
					records={sortedSimplifiedApexValidations}
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
