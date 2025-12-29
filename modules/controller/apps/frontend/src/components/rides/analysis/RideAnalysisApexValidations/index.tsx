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
			title: t('table_columns.created_at'),
			width: 280,
		},
		{
			accessor: 'event_type',
			title: t('table_columns.event_type'),
			width: 100,
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
			accessor: 'product_id',
			title: t('table_columns.product_id'),
			width: 450,
		},
		{
			accessor: 'validation_status',
			render: item => <ApexValidationStatusTag value={item.validation_status} />,
			title: t('table_columns.status'),
			width: 250,
		},
		{
			accessor: 'is_passenger',
			render: item => <ApexValidationIsPassengerTag value={item.is_passenger} />,
			title: t('table_columns.tx_valid'),
			width: 150,
		},
		{
			accessor: 'vehicle_id',
			title: t('table_columns.vehicle_id'),
			width: 120,
		},
		{
			accessor: 'mac_sam_serial_number',
			title: t('table_columns.mac_sam_serial_number'),
			width: 160,
		},
		{
			accessor: '_id',
			title: t('table_columns.id_validation'),
			width: 400,
		},
		{
			accessor: 'on_board_sale_id',
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
					<NoDataLabel text={t('no_data')} />
				</Section>
			)}
		</Collapsible>
	);

	//
}
