'use client';

/* * */

import { IconDownload } from '@tabler/icons-react';
import { Button, DataTable, type DataTableColumn, IconButton, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { GtfsTrip } from './GtfsImport.modal';

/* * */

interface GtfsStepSelectionProps {
	onBack: () => void
	onNext: (trip: GtfsTrip) => void
	trips: GtfsTrip[]
}

/* * */

export function GtfsStepSelection({ onBack, onNext, trips }: GtfsStepSelectionProps) {
	const { t } = useTranslation();

	//

	const columns: DataTableColumn<GtfsTrip>[] = [
		{
			accessor: 'route_id',
			title: t('patterns:detail.GtfsStepSelection.route_id'),
			width: 150,
		},
		{
			accessor: 'trip_headsign',
			title: t('patterns:detail.GtfsStepSelection.headsign_column'),
			width: 350,
		},
		{
			accessor: 'path',
			render: trip => trip.path.length,
			title: t('patterns:detail.GtfsStepSelection.stops'),
			width: 100,
		},
		{
			accessor: 'trip_id',
			render: trip => (
				<IconButton icon={<IconDownload size={16} />} onClick={() => onNext(trip)} tooltip={t('patterns:detail.GtfsStepSelection.select_pattern_hint')} variant="primary" />
			),
			title: t('patterns:detail.GtfsStepSelection.select'),
			width: 100,
		},
	];

	return (
		<Section gap="sm">
			<DataTable columns={columns} records={trips} rowIdAccessor="trip_id" />
			<Button color="gray" label={t('patterns:detail.GtfsStepSelection.back')} onClick={onBack} size="sm" />
		</Section>
	);

	//
}
