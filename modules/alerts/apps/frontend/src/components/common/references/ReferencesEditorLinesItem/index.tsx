'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { IconCornerDownRight, IconMinus } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, HashedTripWaypoint } from '@tmlmobilidade/types';
import { Button, Grid, MultiSelect, Section, Select, type SelectDataItem, Surface, useDataOperationalLines } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface ReferencesEditorLinesItemProps {
	index: number
	onRemoveReference: (index: number) => void
	onUpdateReference: (index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => void
	reference: Alert['references'][number]
}

/* * */

export function ReferencesEditorLinesItem({ index, onRemoveReference, onUpdateReference, reference }: ReferencesEditorLinesItemProps) {
	//

	//
	// A. Fetch data

	const referencesEditorContext = useReferencesEditorContext();

	//
	// B. Fetch data

	const { options: operationalLinesOptions, raw: operationalLinesData } = useDataOperationalLines(API_ROUTES.alerts.OPERATION_LINES, {
		filters: {
			agency_ids: [referencesEditorContext.data.selected_agency_id],
			date_end: referencesEditorContext.data.active_period_end_date,
			date_start: referencesEditorContext.data.active_period_start_date,
		},
	});

	//
	// C. Transform data

	const hashedTripWaypointsAsSelectData: SelectDataItem[] = useMemo(() => {
		// Skip if parent_id is not set
		if (!reference.parent_id) return [];
		// Skip if there is not data
		if (!operationalLinesData?.length) return [];
		// Find the matching line for the reference.parent_id
		const matchingLine = operationalLinesData.find(item => String(item.line_id) === String(reference.parent_id));
		if (!matchingLine) return [];
		// Setup a map to store unique stops
		const uniqueStopsMap = new Map<string, { pattern_id: string, waypoint: HashedTripWaypoint }[]>();
		// Group waypoints by stop_id, as we want unique stop options.
		matchingLine.hashed_trips.forEach((hashedTripItem) => {
			hashedTripItem.path.forEach((waypointItem) => {
				// Check if the stop_id is already in the map.
				// If not, add it with the corresponding label and value.
				if (!uniqueStopsMap.has(waypointItem.stop_id)) {
					uniqueStopsMap.set(String(waypointItem.stop_id), []);
				}
				// Append the current pattern_id and stop_sequence to the label
				// of the existing entry, to provide more context in the option label.
				uniqueStopsMap.get(String(waypointItem.stop_id)).push({
					pattern_id: hashedTripItem.pattern_id,
					waypoint: waypointItem,
				});
			});
		});
		// Return the unique stops as an array of SelectDataItem.
		return Array.from(uniqueStopsMap.entries()).map(([stopId, patternWaypoints]) => {
			// Create a unique set of pattern_id and stop_sequence combinations for the current stop_id
			const uniquePatternStopSequenceCombination = new Set<string>();
			patternWaypoints.forEach(({ waypoint }) => uniquePatternStopSequenceCombination.add(`[${patternWaypoints[0].pattern_id} #${waypoint.stop_sequence}]`));
			return {
				label: `[${stopId}] ${patternWaypoints[0].waypoint.stop_name} ${Array.from(uniquePatternStopSequenceCombination.values()).join(' / ')}`,
				value: stopId,
			};
		});
	}, [operationalLinesData, reference.parent_id]);

	//
	// D. Render components

	return (
		<Surface>
			<Section gap="md">

				<Grid gap="md">
					<Select
						data={operationalLinesOptions}
						label="Linha Afetada"
						onChange={value => onUpdateReference(index, 'parent_id', value)}
						onClear={() => onUpdateReference(index, 'child_ids', [])}
						value={reference.parent_id}
					/>
					<Section flexDirection="row" gap="sm" padding="none">
						<IconCornerDownRight color="var(--color-system-text-300)" size={30} />
						<MultiSelect
							data={hashedTripWaypointsAsSelectData}
							description="Selecione as paragens que serão afetadas pelo alerta"
							disabled={!reference.parent_id}
							label="Paragens Afetadas"
							limit={200}
							onChange={value => onUpdateReference(index, 'child_ids', value)}
							value={reference.child_ids}
							w="100%"
						/>
					</Section>
				</Grid>

				<Section alignItems="flex-end" padding="none">
					<Button
						icon={<IconMinus />}
						label="Remover Linha"
						onClick={() => onRemoveReference(index)}
						variant="danger"
					/>
				</Section>

			</Section>
		</Surface>
	);

	//
}
