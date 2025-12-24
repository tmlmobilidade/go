/* * */

import { useRealtimeCreateContext } from '@/components/realtime/create/RealtimeCreate.context';
import { getAlertTitleAndDescription, Translations } from '@/lib/translations';
import { Dates } from '@tmlmobilidade/dates';
import { RideNormalized, UnixTimestamp } from '@tmlmobilidade/types';
import { DataTable, DataTableColumn, Divider, Grid, Section, Tag, Textarea, TextInput, ValueDisplay } from '@tmlmobilidade/ui';
import { useEffect, useMemo } from 'react';

import { OperationalStatusTag } from '../OperationalStatusTag';
import { RidesListCellHeadsign } from '../RidesListCellHeadsign';
import { SeenStatusTag } from '../SeenStatusTag';

/* * */

export function RealtimeCreateStepSummary() {
	//

	//
	// A. Setup variables

	const realtimeCreateContext = useRealtimeCreateContext();

	const formatTimestamp = (timestamp: UnixTimestamp) => {
		return timestamp ? Dates.fromUnixTimestamp(timestamp).setZone('Europe/Lisbon', 'offset_only').toLocaleString(Dates.FORMATS.TIME_SIMPLE, 'pt') : null;
	};

	const columns: DataTableColumn<RideNormalized>[] = [
		{
			accessor: 'seen_last_at',
			render: item => <SeenStatusTag value={item.seen_status} />,
			title: '',
			width: 24,
		},
		{
			accessor: 'operational_status',
			render: item => <OperationalStatusTag value={item.operational_status} />,
			title: 'Estado',
			width: 150,
		},
		{
			accessor: 'headsign',
			render: item => <RidesListCellHeadsign headsign={item.headsign} patternId={item.pattern_id} />,
			title: 'Pattern',
			width: 500,
		},
		{
			accessor: 'start_time_scheduled',
			render: item => <Tag label={formatTimestamp(item.start_time_scheduled)} variant="muted" />,
			title: 'Partida',
			width: 80,
		},
	];

	//
	// B. Transform data

	useEffect(() => {
		const uniqueLineIds = Array.from(new Set(realtimeCreateContext.data.form.getValues().references?.map(ride => ride.parent_id)));
		const { description, title } = getAlertTitleAndDescription(realtimeCreateContext.data.form.values.cause, realtimeCreateContext.data.form.values.effect, uniqueLineIds.join(', '));
		realtimeCreateContext.data.form.setFieldValue('title', title);
		realtimeCreateContext.data.form.setFieldValue('description', description);
	}, []);

	const visibleRides = useMemo(() => {
		const selectedRideIds = realtimeCreateContext.data.form.getValues().references?.map(reference => reference.parent_id) ?? [];
		return realtimeCreateContext.data.filtered_rides.filter(ride => selectedRideIds.some(selectedRideId => selectedRideId === ride._id) ?? false);
	}, [realtimeCreateContext.data.filtered_rides, realtimeCreateContext.data.form]);

	//
	// C. Render components

	return (
		<>

			<Section>
				<Grid gap="md">
					<TextInput
						defaultValue={realtimeCreateContext.data.form.getValues().title}
						label="Título"
						readOnly
					/>
					<Textarea
						defaultValue={realtimeCreateContext.data.form.getValues().description}
						label="Descrição"
						minRows={4}
						autosize
						readOnly
					/>
					<Grid columns="abc" gap="md">
						<ValueDisplay label="Causa" value={Translations.CAUSE[realtimeCreateContext.data.form.getValues().cause]} bordered />
						<ValueDisplay label="Efeito" value={Translations.EFFECT[realtimeCreateContext.data.form.getValues().effect]} bordered />
						<ValueDisplay label="Circulações Afetadas" value={realtimeCreateContext.data.form.getValues().references?.length} bordered />
					</Grid>
				</Grid>
			</Section>

			<Divider />

			<DataTable
				columns={columns}
				records={visibleRides}
				rowIdAccessor="_id"
			/>

		</>
	);

	//
}
