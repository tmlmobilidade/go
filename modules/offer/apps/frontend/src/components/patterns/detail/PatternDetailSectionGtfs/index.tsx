'use client';

/* * */

import { usePatternDetailContext } from '@/components/patterns/detail/PatternDetail.context';
import { openGtfsImportConfirmationModal } from '@/components/patterns/detail/PatternDetailSectionGtfs/GtfsImportConfirmation.modal';
import { GtfsParser } from '@/components/patterns/detail/PatternDetailSectionGtfs/GtfsParser';
import { IconDownload } from '@tabler/icons-react';
import { Button, Collapsible, DataTable, type DataTableColumn, Section, Tooltip } from '@tmlmobilidade/ui';
import { useState } from 'react';

/* * */

export interface GtfsTrip {
	path: {
		avg_speed: number
		dwell_time: number
		shape_dist_traveled: number
		stop_id: string
		stop_sequence: number
	}[]
	route_id: string
	shape: {
		points: {
			shape_dist_traveled: number
			shape_pt_lat: number
			shape_pt_lon: number
			shape_pt_sequence: number
		}[]
	}
	trip_headsign: string
	trip_id: string
}

export interface GtfsRoute {
	route_id: string
	trips: GtfsTrip[]
}

/* * */

export function PatternDetailSectionGtfs() {
	//

	//
	// A. Setup variables

	const patternDetailContext = usePatternDetailContext();
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

	const handleClearTable = () => {
		setParseResult(null);
	};

	const handleOpenImportModal = (trip: GtfsTrip) => {
		const currentStopCount = patternDetailContext.data.pattern?.path?.length || 0;
		const currentShapeExtension = patternDetailContext.data.pattern?.shape?.extension || 0;

		openGtfsImportConfirmationModal({
			currentShapeExtension,
			currentStopCount,
			onLoad: patternDetailContext.actions.mutate,
			patternId: patternDetailContext.data.id,
			selectedTrip: trip,
		});
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
			width: 150,
		},
		{
			accessor: 'trip_id',
			render: trip => (
				<Tooltip label="Esta ação irá substituir o percurso e shape atuais" w={220} multiline>
					<Button
						icon={<IconDownload size={16} />}
						label="Importar"
						onClick={() => handleOpenImportModal(trip)}
						size="xs"
					/>
				</Tooltip>
			),
			title: 'Importar',
			width: 300,
		},
	];

	return (
		<Collapsible description="Atualizar a shape e sequência de paragens com a importação de um GTFS-Remix." title="Atualizar percurso">
			<Section gap="sm">
				{!parseResult ? (
					<GtfsParser onParse={handleParse} />
				) : (
					<>
						<div style={{ width: '100%' }}>
							<DataTable
								columns={columns}
								records={parseResult}
								rowIdAccessor="trip_id"
							/>
						</div>
						<Button color="gray" label="Limpar resultados" onClick={handleClearTable} size="sm" />
					</>
				)}
			</Section>
		</Collapsible>
	);

	//
}
