'use client';

import { useReferencesEditorContext } from '@/components/references/shared/ReferencesEditor.context';
import { IconCornerDownRight, IconMinus } from '@tabler/icons-react';
import { type Alert } from '@tmlmobilidade/go-types-operation';
import { Button, Grid, MultiSelect, Section, Select, type SelectDataItem, Surface } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import { useAlertsStopsData } from '../use-alerts-stops-data';

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

	const { data: alertsStopsData } = useAlertsStopsData();

	//
	// B. Transform data

	const currentStopData = useMemo(() => {
		// Find the matching stop for the reference.parent_id
		return alertsStopsData?.find(item => String(item.stop_id) === String(reference.parent_id));
	}, [alertsStopsData, reference.parent_id]);

	const stopsAsSelectData: SelectDataItem[] = useMemo(() => {
		return alertsStopsData?.map(item => ({
			label: `[${item.stop_id}] ${item.stop_name}`,
			value: item.stop_id,
		}));
	}, [alertsStopsData]);

	const linesAsSelectData: SelectDataItem[] = useMemo(() => {
		// Skip if parent_id is not set
		if (!currentStopData) return [];
		// Set a map of unique stop ids to avoid duplicates
		const lineLabels = new Map<string, string>();
		currentStopData.routes?.forEach((route) => {
			if (!lineLabels.has(route.route_short_name)) {
				const newLabelValue = `[${route.route_short_name}] ${route.route_long_name} | ${route.route_shape_id}`;
				lineLabels.set(route.route_short_name, newLabelValue);
			} else {
				const updatedLabelValue = `${lineLabels.get(route.route_short_name)} ${route.route_shape_id}`;
				lineLabels.set(route.route_short_name, updatedLabelValue);
			}
		});
		// Return the lines as an array of SelectDataItem.
		return Array.from(lineLabels.entries()).map(([routeShortName, label]) => ({ label, value: routeShortName }));
	}, [currentStopData]);

	//
	// C. Render components

	return (
		<Surface>
			<Section gap="md">
				<Grid gap="md">
					<Select
						data={stopsAsSelectData}
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
							data={linesAsSelectData}
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
