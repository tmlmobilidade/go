'use client';

/* * */

import { openGtfsImportConfirmationModal } from '@/components/patterns/detail/PatternDetailSectionGtfs/GtfsImportConfirmation.modal';
import { GtfsParser } from '@/components/patterns/detail/PatternDetailSectionGtfs/GtfsParser';
import { type GtfsRoute, type GtfsTrip } from '@/components/patterns/detail/PatternDetailSectionGtfs/index';
import { IconDownload, IconFileZip } from '@tabler/icons-react';
import { type Pattern } from '@tmlmobilidade/types';
import { Button, DataTable, type DataTableColumn, IconButton, Popover, Section } from '@tmlmobilidade/ui';
import { useState } from 'react';

/* * */

interface GtfsImportPopoverProps {
	currentShapeExtension: number
	currentStopCount: number
	onLoad: (pattern: Pattern) => void
	patternId: string
}

/* * */

export function GtfsImportPopover({ currentShapeExtension, currentStopCount, onLoad, patternId }: GtfsImportPopoverProps) {
	//

	//
	// A. Setup variables

	const [opened, setOpened] = useState(false);
	const [parseResult, setParseResult] = useState<GtfsTrip[] | null>(null);

	//
	// B. Handle actions

	const handleParse = (gtfsAsJson: GtfsRoute[]) => {
		try {
			const trips: GtfsTrip[] = [];
			for (const route of gtfsAsJson) {
				for (const trip of route.trips) {
					trips.push(trip);
				}
			}
			setParseResult(trips);
		} catch {
			setParseResult(null);
		}
	};

	const handleOpenImportModal = (trip: GtfsTrip) => {
		setOpened(false);
		openGtfsImportConfirmationModal({
			currentShapeExtension,
			currentStopCount,
			onLoad: (pattern: Pattern) => {
				setOpened(false);
				setParseResult(null);
				onLoad(pattern);
			},
			patternId,
			selectedTrip: trip,
		});
	};

	const handleClose = () => {
		setOpened(false);
		setParseResult(null);
	};

	//
	// C. Render components

	const columns: DataTableColumn<GtfsTrip>[] = [
		{
			accessor: 'route_id',
			title: 'Route ID',
			width: 150,
		},
		{
			accessor: 'trip_headsign',
			title: 'Headsign',
			width: 300,
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
				<IconButton icon={<IconDownload size={16} />} onClick={() => handleOpenImportModal(trip)} tooltip="Esta ação irá substituir o percurso e shape atuais" variant="primary" />
			),
			title: 'Importar',
			width: 100,
		},
	];

	return (
		<Popover
			onChange={setOpened}
			onClose={handleClose}
			opened={opened}
			position="bottom-start"
			shadow="md"
			width={parseResult ? 700 : 500}
			withArrow
		>
			<Popover.Target>
				<Button
					label="Importar ficheiro GTFS"
					leftSection={<IconFileZip />}
					onClick={() => setOpened(v => !v)}
					variant="secondary"
				/>
			</Popover.Target>

			<Popover.Dropdown>
				<Section gap="sm" padding="none">
					{!parseResult
						? (
							<GtfsParser onParse={handleParse} />
						)
						: (
							<>
								<DataTable
									columns={columns}
									records={parseResult}
									rowIdAccessor="trip_id"
								/>
								<Button color="gray" label="Limpar resultados" onClick={() => setParseResult(null)} size="sm" />
							</>
						)}
				</Section>
			</Popover.Dropdown>
		</Popover>
	);

	//
}
