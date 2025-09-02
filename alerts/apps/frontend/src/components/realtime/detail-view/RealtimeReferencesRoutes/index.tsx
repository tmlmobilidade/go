'use client';

/* * */

import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { useLinesContext } from '@/contexts/Lines.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { IconCornerDownRight, IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Combobox, Label, MultiSelect, Section, Surface } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

export function RealtimeReferencesLines() {
	//

	//
	// A. Setup variables

	const realtimeDetailContext = useRealtimeDetailContext();

	//
	// B. Transform data

	const references = useMemo(
		() => realtimeDetailContext.data.form.values.references,
		[realtimeDetailContext.data.form.values.references],
	);

	//
	// C. Render components

	return (
		<div className={styles.container}>
			{references.length === 0 ? (
				<Surface>
					<Section>
						<Label size="md" caps>Não há referências disponíveis.</Label>
					</Section>
				</Surface>
			) : (
				references.map((_, index) => (
					<RealtimeReferencesLinesItem key={index} index={index} />
				))
			)}
			<Button
				className={styles.button}
				icon={<IconPlus size={18} />}
				label="Adicionar Rota"
				onClick={realtimeDetailContext.actions.addReference}
				variant="primary"
			/>
		</div>
	);
}

/* * */

function RealtimeReferencesLinesItem({ index }: { index: number }) {
	//

	//
	// A. Setup variables

	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();
	const realtimeDetailContext = useRealtimeDetailContext();

	//
	// B. Transform data

	const availableLines = useMemo(() => {
		if (!linesContext.data.lines) return [];

		if (realtimeDetailContext.data.form.values.municipality_ids.length === 0)
			return linesContext.data.lines.map(line => ({
				label: `[${line.id}] ${line.long_name}`,
				value: line.id,
			}));

		return linesContext.data.lines
			.filter(line =>
				line.municipality_ids.some((municipality: string) =>
					realtimeDetailContext.data.form.values.municipality_ids.includes(
						municipality,
					),
				),
			)
			.map(line => ({
				label: `[${line.id}] ${line.long_name}`,
				value: line.id,
			}));
	}, [linesContext.data.lines, realtimeDetailContext.data.form.values.municipality_ids]);

	const availableStops = useMemo(() => {
		if (!stopsContext.data.stops) return [];
		if (!realtimeDetailContext.data.form.values.references[index].parent_id)
			return [];

		return stopsContext.data.stops
			.filter(stop =>
				stop.line_ids.includes(
					realtimeDetailContext.data.form.values.references[index].parent_id,
				),
			)
			.map(stop => ({
				label: `[${stop.id}] ${stop.long_name}`,
				value: stop.id,
			}));
	}, [
		stopsContext.data.stops,
		realtimeDetailContext.data.form.values.references[index].parent_id,
	]);

	//
	// C. Render components

	return (
		<Surface>
			<Section gap="md">
				<Combobox
					aria-label="Linha Afetada"
					data={availableLines}
					label="Linha Afetada"
					clearable
					fullWidth
					searchable
					{...realtimeDetailContext.data.form.getInputProps(`references.${index}.parent_id`)}
				/>
				<div className={styles.childrenWrapper}>
					<IconCornerDownRight className={styles.icon} size={28} />
					<MultiSelect
						aria-label="Paragens Afetadas"
						data={availableStops}
						description="Selecione as paragens que serão afetadas pelo realtimea"
						label="Paragens Afetadas"
						selected={realtimeDetailContext.data.form.values.references[index].child_ids}
						{...realtimeDetailContext.data.form.getInputProps(
							`references.${index}.child_ids`,
						)}
					/>
				</div>
				<div className={styles.deleteButtonWrapper}>
					<Button
						className={styles.button}
						icon={<IconTrash size={18} />}
						label="Eliminar"
						onClick={() => realtimeDetailContext.actions.removeReference(index)}
						variant="danger"
					/>
				</div>
			</Section>
		</Surface>
	);

	//
}
