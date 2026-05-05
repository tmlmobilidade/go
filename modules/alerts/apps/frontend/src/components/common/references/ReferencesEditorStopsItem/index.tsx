'use client';

/* * */

import { useReferencesEditorContext } from '@/components/common/references/ReferencesEditor.context';
import { IconCornerDownRight, IconMinus } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type Alert } from '@tmlmobilidade/types';
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

	const hashedTripsAsSelectData: SelectDataItem[] = useMemo(() => {
		// Skip if parent_id is not set
		if (!reference.parent_id) return [];
		// Skip if there is not data
		if (!operationalStopsData?.length) return [];
		// Find the matching line for the reference.parent_id
		const matchingStop = operationalStopsData.find(item => String(item.stop_id) === String(reference.parent_id));
		if (!matchingStop) return [];
		// Setup a map to store unique stops
		const uniqueLinesMap = new Map<string, { line_id: string, line_long_name: string, line_short_name: string }>();
		// Group waypoints by stop_id, as we want unique stop options.
		matchingStop.hashed_trips.forEach((hashedTripItem) => {
			// Skip if the line_id is already in the uniqueLinesMap.
			if (uniqueLinesMap.has(String(hashedTripItem.line_id))) return;
			// If not, add it with the corresponding label and value.
			uniqueLinesMap.set(String(hashedTripItem.line_id), {
				line_id: String(hashedTripItem.line_id),
				line_long_name: hashedTripItem.line_long_name,
				line_short_name: hashedTripItem.line_short_name,
			});
		});
		// Return the unique stops as an array of SelectDataItem.
		return Array.from(uniqueLinesMap.entries()).map(([lineId, lineData]) => {
			return {
				label: `(${lineData.line_short_name}) ${lineData.line_long_name}`,
				value: lineId,
			};
		});
	}, [operationalStopsData, reference.parent_id]);

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
						readOnly={referencesEditorContext.flags.isReadonly}
						value={reference.parent_id}
					/>
					<Section flexDirection="row" gap="sm" padding="none">
						<IconCornerDownRight color="var(--color-system-text-300)" size={30} />
						<MultiSelect
							data={hashedTripsAsSelectData}
							description="Selecione as linhas que serão afetadas pelo alerta"
							disabled={!reference.parent_id}
							label="Linhas Afetadas"
							onChange={value => onUpdateReference(index, 'child_ids', value)}
							readOnly={referencesEditorContext.flags.isReadonly}
							value={reference.child_ids}
							w="100%"
						/>
					</Section>
				</Grid>
				<Section alignItems="flex-end" padding="none">
					{!referencesEditorContext.flags.isReadonly && (
						<Button
							icon={<IconMinus />}
							label="Remover Paragem"
							onClick={() => onRemoveReference(index)}
							variant="danger"
						/>
					)}
				</Section>
			</Section>
		</Surface>
	);

	//
}
