'use client';

/* * */

import { ReferencesLinesItem } from '@/components/common/references/ReferencesLinesItem';
import { useLinesContext } from '@/contexts/Lines.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { IconPlus } from '@tabler/icons-react';
import { type Alert } from '@tmlmobilidade/types';
import { Button, NoDataLabel, Section, Surface } from '@tmlmobilidade/ui';

/* * */

interface ReferencesLinesProps {
	municipalityIds?: string[]
	onAddReference: () => void
	onRemoveReference: (index: number) => void
	onUpdateReference: (index: number, field: 'child_ids' | 'parent_id', value: string | string[]) => void
	references: Alert['references']
}

export function ReferencesLines({ municipalityIds, onAddReference, onRemoveReference, onUpdateReference, references }: ReferencesLinesProps) {
	//

	//
	// A. Setup variables

	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();

	//
	// B. Render components

	return (
		<Section gap="md" padding="none">

			{!references?.length && (
				<Surface>
					<Section alignItems="center">
						<NoDataLabel text="Nenhuma linha selecionada" />
					</Section>
				</Surface>
			)}

			{references.map((reference, index) => (
				<ReferencesLinesItem
					key={index}
					index={index}
					lines={linesContext.data.lines}
					municipalityIds={municipalityIds}
					onRemoveReference={onRemoveReference}
					onUpdateReference={onUpdateReference}
					reference={reference}
					stops={stopsContext.data.stops}
				/>
			))}

			<Button
				icon={<IconPlus />}
				label="Adicionar Linha"
				onClick={onAddReference}
				variant="secondary"
			/>

		</Section>
	);

	//
}
