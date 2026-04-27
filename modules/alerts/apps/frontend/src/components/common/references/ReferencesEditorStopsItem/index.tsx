'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { IconCornerDownRight, IconMinus } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert, type HashedTrip } from '@tmlmobilidade/types';
import { Button, Grid, MultiSelect, Section, Select, type SelectDataItem, Surface, useDataOperationalStops } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface ReferencesEditorStopsItemProps {
	index: number
	onRemoveReference: (index: number) => void
	onUpdateReference: (index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => void
	reference: Alert['references'][number]
}

/* * */

export function ReferencesEditorStopsItem({ index, onRemoveReference, onUpdateReference, reference }: ReferencesEditorStopsItemProps) {
	//

	//
	// A. Fetch data

	const referencesEditorContext = useReferencesEditorContext();

	//
	// B. Fetch data

	const { options: operationalStopsOptions, raw: operationalStopsData } = useDataOperationalStops(API_ROUTES.alerts.OPERATION_STOPS, {
		filters: {
			agency_ids: [referencesEditorContext.data.selected_agency_id],
			date_end: referencesEditorContext.data.active_period_end_date,
			date_start: referencesEditorContext.data.active_period_start_date,
		},
	});

	//
	// C. Transform data

	// const hashedTripsAsSelectData: SelectDataItem[] = useMemo(() => {
	// 	// Skip if there are no hashedTrips
	// 	// or if parent_id is not set
	// 	if (!hashedTrips?.length) return [];
	// 	if (!reference.parent_id) return [];
	// 	const matchingHashedTrips = hashedTrips.filter(item => item.path.some(waypoint => String(waypoint.stop_id) === String(reference.parent_id)));
	// 	if (!matchingHashedTrips.length) return [];
	// 	// Group hashedTrips by line_id,
	// 	// as we want unique line options.
	// 	const uniqueLinesMap = new Map<HashedTrip['line_id'], SelectDataItem>();
	// 	matchingHashedTrips.forEach((hashedTripItem) => {
	// 		// Add the matching hashedTrips to the uniqueLinesMap
	// 		if (uniqueLinesMap.has(hashedTripItem.line_id)) return;
	// 		uniqueLinesMap.set(hashedTripItem.line_id, {
	// 			label: `[${hashedTripItem.line_short_name}] ${hashedTripItem.line_long_name}`,
	// 			value: String(hashedTripItem.line_id),
	// 		});
	// 	});
	// 	// Return the unique lines as an array of SelectDataItem.
	// 	return Array.from(uniqueLinesMap.values());
	// }, [hashedTrips, reference.parent_id]);

	//
	// C. Render components

	return (
		<Surface>
			<Section gap="md">
				<Grid gap="md">
					<Select
						data={operationalStopsOptions}
						label="Paragem Afetada"
						limit={25}
						onChange={value => onUpdateReference(index, 'parent_id', value)}
						onClear={() => onUpdateReference(index, 'child_ids', [])}
						value={reference.parent_id}
					/>
					<Section flexDirection="row" gap="sm" padding="none">
						<IconCornerDownRight color="var(--color-system-text-300)" size={30} />
						<MultiSelect
							data={[]}
							description="Selecione as linhas que serão afetadas pelo alerta"
							disabled={!reference.parent_id}
							label="Linhas Afetadas"
							onChange={value => onUpdateReference(index, 'child_ids', value)}
							value={reference.child_ids}
							w="100%"
						/>
					</Section>
				</Grid>
				<Section alignItems="flex-end" padding="none">
					<Button
						icon={<IconMinus />}
						label="Remover Paragem"
						onClick={() => onRemoveReference(index)}
						variant="danger"
					/>
				</Section>
			</Section>
		</Surface>
	);

	//
}
