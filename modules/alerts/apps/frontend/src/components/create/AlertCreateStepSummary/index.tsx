/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { getAlertTitleAndDescription, Translations } from '@/lib/translations';
import { Dates } from '@tmlmobilidade/dates';
import { RideNormalized, UnixTimestamp } from '@tmlmobilidade/types';
import { DataTable, DataTableColumn, Divider, Grid, Section, Tag, Textarea, TextInput, ValueDisplay } from '@tmlmobilidade/ui';
import { useEffect, useMemo } from 'react';

import { OperationalStatusTag } from '../OperationalStatusTag';
import { RidesListCellHeadsign } from '../RidesListCellHeadsign';
import { SeenStatusTag } from '../SeenStatusTag';

/* * */

export function AlertCreateStepSummary() {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();

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

	// useEffect(() => {
	// 	const uniqueLineIds = Array.from(new Set(alertCreateContext.data.form.getValues().references?.map(ride => ride.parent_id)));
	// 	const { description, title } = getAlertTitleAndDescription(alertCreateContext.data.form.values.cause, alertCreateContext.data.form.values.effect, uniqueLineIds.join(', '));
	// 	alertCreateContext.data.form.setFieldValue('title', title);
	// 	alertCreateContext.data.form.setFieldValue('description', description);
	// }, []);

	const visibleRides = useMemo(() => {
		const selectedRideIds = alertCreateContext.data.form.getValues().references?.map(reference => reference.parent_id) ?? [];
		return alertCreateContext.data.filtered_rides.filter(ride => selectedRideIds.some(selectedRideId => selectedRideId === ride._id) ?? false);
	}, [alertCreateContext.data.filtered_rides, alertCreateContext.data.form]);

	//
	// C. Render components

	return (
		<>

			<Section>
				<Grid gap="md">
					<TextInput
						defaultValue={alertCreateContext.data.form.getValues().title}
						label="Título"
						readOnly
					/>
					<Textarea
						defaultValue={alertCreateContext.data.form.getValues().description}
						label="Descrição"
						minRows={4}
						autosize
						readOnly
					/>
					<Grid columns="abc" gap="md">
						<ValueDisplay label="Causa" value={Translations.CAUSE[alertCreateContext.data.form.getValues().cause]} bordered />
						<ValueDisplay label="Efeito" value={Translations.EFFECT[alertCreateContext.data.form.getValues().effect]} bordered />
						<ValueDisplay label="Circulações Afetadas" value={alertCreateContext.data.form.getValues().references?.length} bordered />
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
