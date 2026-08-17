'use client';

import { useReferencesEditorContext } from '@/components/references/shared/ReferencesEditor.context';
import { IconCornerDownRight, IconMinus } from '@tabler/icons-react';
import { type Alert } from '@tmlmobilidade/go-types-operation';
import { Button, Grid, MultiSelect, Section, Select, type SelectDataItem, Surface } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useAlertsLinesData } from '../use-alerts-lines-data';

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

	const { data: alertsLinesData } = useAlertsLinesData();

	//
	// B. Transform data

	const linesAsSelectData: SelectDataItem[] = useMemo(() => {
		return alertsLinesData?.map(item => ({ label: item.route_short_name, value: item.route_short_name }));
	}, [alertsLinesData]);

	const currentLineData = useMemo(() => {
		// Find the matching line for the reference.parent_id
		return alertsLinesData?.find(item => String(item.route_short_name) === String(reference.parent_id));
	}, [alertsLinesData, reference.parent_id]);

	const stopsAsSelectData: SelectDataItem[] = useMemo(() => {
		// Skip if parent_id is not set
		if (!currentLineData) return [];
		// Return the stops as an array of SelectDataItem.
		return currentLineData.patterns.flatMap(pattern => pattern.stops.map(stop => ({ label: stop.stop_name, value: stop.stop_id })));
	}, [currentLineData]);

	//
	// C. Render components

	return (
		<Surface>
			<Section gap="md">

				<Grid gap="md">
					<Select
						data={linesAsSelectData}
						label="Linha Afetada"
						onChange={value => onUpdateReference(index, 'parent_id', value)}
						onClear={() => onUpdateReference(index, 'child_ids', [])}
						readOnly={referencesEditorContext.flags.isReadonly}
						value={reference.parent_id}
					/>
					<Section flexDirection="row" gap="sm" padding="none">
						<IconCornerDownRight color="var(--color-system-text-300)" size={30} />
						<MultiSelect
							data={stopsAsSelectData}
							description="Selecione as paragens que serão afetadas pelo alerta"
							disabled={!reference.parent_id}
							label="Paragens Afetadas"
							limit={200}
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
							label="Remover Linha"
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
