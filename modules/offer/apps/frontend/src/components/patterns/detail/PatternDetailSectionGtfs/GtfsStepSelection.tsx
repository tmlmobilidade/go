'use client';

/* * */

import { IconDownload } from '@tabler/icons-react';
import { Button, DataTable, type DataTableColumn, IconButton, Section } from '@tmlmobilidade/ui';

import { GtfsTrip } from './GtfsImport.modal';

/* * */

interface GtfsStepSelectionProps {
	onBack: () => void
	onNext: (trip: GtfsTrip) => void
	trips: GtfsTrip[]
}

/* * */

export function GtfsStepSelection({ onBack, onNext, trips }: GtfsStepSelectionProps) {
	//

	const columns: DataTableColumn<GtfsTrip>[] = [
		{
			accessor: 'route_id',
			title: 'Route ID',
			width: 150,
		},
		{
			accessor: 'trip_headsign',
			title: 'Headsign',
			width: 350,
		},
		{
			accessor: 'path',
			render: trip => trip.path.length,
			title: 'Paragens',
			width: 100,
		},
		{
			accessor: 'trip_id',
			render: trip => (
				<IconButton icon={<IconDownload size={16} />} onClick={() => onNext(trip)} tooltip="Selecionar este percurso" variant="primary" />
			),
			title: 'Selecionar',
			width: 100,
		},
	];

	return (
		<Section gap="sm">
			<DataTable columns={columns} records={trips} rowIdAccessor="trip_id" />
			<Button color="gray" label="Voltar" onClick={onBack} size="sm" />
		</Section>
	);

	//
}
