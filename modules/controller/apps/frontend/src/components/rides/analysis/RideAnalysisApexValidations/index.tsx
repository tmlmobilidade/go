'use client';

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
	const { t } = useTranslation();

	const columns: DataTableColumn<SimplifiedApexValidation>[] = [
		{
			accessor: 'created_at',
			render: item => <TimestampTag value={item.created_at} />,
		title: t('default:rides.analysis.RideAnalysisApexValidations.Table.columns.created_at.label'),
		width: 280,
	},
	{
		accessor: 'event_type',
		title: t('default:rides.analysis.RideAnalysisApexValidations.Table.columns.event_type.label'),
		width: 100,
	},
	{
		accessor: 'stop_id',
		title: t('default:rides.analysis.RideAnalysisApexValidations.Table.columns.stop_id.label'),
		width: 100,
	},
	{
		accessor: 'card_serial_number',
		title: t('default:rides.analysis.RideAnalysisApexValidations.Table.columns.card_serial_number.label'),
		width: 220,
	},
	{
		accessor: 'product_id',
		title: t('default:rides.analysis.RideAnalysisApexValidations.Table.columns.product_id.label'),
		width: 450,
	},
	{
		accessor: 'validation_status',
		render: item => <ApexValidationStatusTag value={item.validation_status} />,
		title: t('default:rides.analysis.RideAnalysisApexValidations.Table.columns.status.label'),
		width: 250,
	},
	{
		accessor: 'is_passenger',
		render: item => <ApexValidationIsPassengerTag value={item.is_passenger} />,
		title: t('default:rides.analysis.RideAnalysisApexValidations.Table.columns.tx_valid.label'),
		width: 150,
	},
	{
		accessor: 'vehicle_id',
		title: t('default:rides.analysis.RideAnalysisApexValidations.Table.columns.vehicle_id.label'),
		width: 120,
	},
	{
		accessor: 'mac_sam_serial_number',
		title: t('default:rides.analysis.RideAnalysisApexValidations.Table.columns.mac_sam_serial_number.label'),
		width: 160,
	},
	{
		accessor: '_id',
		title: t('default:rides.analysis.RideAnalysisApexValidations.Table.columns.id_validation.label'),
		width: 400,
	},
	{
		accessor: 'on_board_sale_id',
		title: t('default:rides.analysis.RideAnalysisApexValidations.Table.columns.id_on_board_sale.label'),
		width: 400,
	},
	{
		accessor: 'on_board_refund_id',
		title: t('default:rides.analysis.RideAnalysisApexValidations.Table.columns.id_on_board_refund.label'),
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
	<Collapsible description={t('default:rides.analysis.RideAnalysisApexValidations.description')} title={t('default:rides.analysis.RideAnalysisApexValidations.title')}>
		{sortedSimplifiedApexValidations.length > 0 ? (
			<DataTable
				columns={columns}
				records={sortedSimplifiedApexValidations}
				rowIdAccessor="_id"
			/>
		) : (
			<Section padding="md">
				<NoDataLabel text={t('default:rides.analysis.RideAnalysisApexValidations.no_data')} />
				</Section>
			)}
		</Collapsible>
	);

	//
}
