import { getDelayStatus, StartTimeStatusTag } from '@/components/common/StartTimeStatusTag';
import { useRealtimeCreateContext } from '@/contexts/RealtimeCreate.context';
import { RidesData } from '@/contexts/Rides.context';
import { Dates } from '@tmlmobilidade/dates';
import { DataTable, DataTableColumn, Label, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

export function AffectedRides() {
	//

	//
	// A. Setup variables
	const realtimeContext = useRealtimeCreateContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'realtime.create.stepSummary.affectedRides' });

	const columns: DataTableColumn<RidesData>[] = [
		{
			accessor: '_id',
			title: t('tableColumns.id'),
			width: 400,
		},
		{
			accessor: 'headsign',
			title: t('tableColumns.headsign'),
			width: 300,
		},
		{
			accessor: 'start_time_scheduled',
			render: item => (
				<StartTimeStatusTag
					startTimeObserved={Dates.fromUnixTimestamp(item.start_time_scheduled).setZone('Europe/Lisbon', 'offset_only').toLocaleString(Dates.FORMATS.TIME_SIMPLE, 'pt')}
					status={getDelayStatus(item.start_time_scheduled, item.start_time_observed)}
				/>
			),
			title: t('tableColumns.startTimeScheduled'),
			width: 300,
		},
	];

	//
	// B. Render components

	return (
		<Section gap="md">
			<Label size="md" caps>{t('title')}</Label>
			<div style={{ overflowX: 'scroll', width: '100%' }}>
				<DataTable
					columns={columns as DataTableColumn<unknown>[]}
					records={realtimeContext.data.selectedRides}
					rowIdAccessor="_id"
				/>
			</div>
		</Section>
	);
}
