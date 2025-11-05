import { getDelayStatus, StartTimeStatusTag } from '@/components/common/StartTimeStatusTag';
import { useRealtimeCreateContext } from '@/contexts/RealtimeCreate.context';
import { RidesData } from '@/contexts/Rides.context';
import { DataTable, DataTableColumn, Label, Section } from '@tmlmobilidade/ui';
import { Dates } from '@go/utils-dates';

export function AffectedRides() {
	const realtimeContext = useRealtimeCreateContext();

	const columns: DataTableColumn<RidesData>[] = [
		{
			accessor: '_id',
			title: 'ID',
			width: 400,
		},
		{
			accessor: 'headsign',
			title: 'Destino',
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
			title: 'Partida',
			width: 300,
		},
	];

	return (
		<Section gap="md">
			<Label size="md" caps>Viagens afetadas</Label>
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
