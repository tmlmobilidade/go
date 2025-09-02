'use client';

/* * */

import { useRealtimeDetailContext } from '@/contexts/RealtimeCreate.context';
import { useLinesContext } from '@/contexts/Lines.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { IconCornerDownRight, IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Combobox, Label, MultiSelect, Section, Surface } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

export function RealtimeReferencesStops() {
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
				references.map((reference, index) => (
					<RealtimeReferencesStopsItem key={index} index={index} />
				))
			)}
			<Button
				className={styles.button}
				icon={<IconPlus size={18} />}
				label="Adicionar Paragem"
				onClick={realtimeDetailContext.actions.addReference}
				variant="primary"
			/>
		</div>
	);

	//
}

function RealtimeReferencesStopsItem({ index }: { index: number }) {
	//

	//
	// A. Setup variables

	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();
	const realtimeDetailContext = useRealtimeDetailContext();

	//
	// B. Transform data

	const availableStops = useMemo(() => {
		if (!stopsContext.data.stops) return [];
		if (!realtimeDetailContext.data.form.values.municipality_ids) return [];

		return stopsContext.data.stops
			.filter(stop =>
				realtimeDetailContext.data.form.values.municipality_ids.includes(
					stop.municipality_id,
				),
			)
			.map(stop => ({
				label: `[${stop.id}] ${stop.long_name}`,
				value: stop.id,
			}));
	}, [stopsContext.data.stops, realtimeDetailContext.data.form.values.municipality_ids]);

	const availableRoutes = useMemo(() => {
		if (!linesContext.data.lines) return [];
		if (!realtimeDetailContext.data.form.values.references[index].parent_id)
			return [];

		const selectedStop = stopsContext.data.stops.find(
			stop =>
				stop.id
				=== realtimeDetailContext.data.form.values.references[index].parent_id,
		);
		return (
			selectedStop?.line_ids.map(lineId => ({
				label: `[${lineId}] ${
					linesContext.data.lines.find(line => line.id === lineId)
						?.long_name
				}`,
				value: lineId,
			})) || []
		);
	}, [
		linesContext.data.lines,
		realtimeDetailContext.data.form.values.municipality_ids,
		realtimeDetailContext.data.form.values.references[index].parent_id,
	]);

	//
	// C. Render components

	return (
		<Surface>
			<Section gap="md">
				<Combobox
					aria-label="Paragem Afetada"
					data={availableStops}
					label="Paragem Afetada"
					placeholder={realtimeDetailContext.data.form.values.municipality_ids.length === 0 ? 'Selecione os Municípios' : 'Selecione a Paragem'}
					clearable
					fullWidth
					searchable
					{...realtimeDetailContext.data.form.getInputProps(`references.${index}.parent_id`)}
				/>
				<div className={styles.childrenWrapper}>
					<IconCornerDownRight className={styles.icon} size={28} />
					<MultiSelect
						aria-label="Linhas Afetadas"
						data={availableRoutes}
						description="Selecione as linhas que serão afetadas pelo realtimea"
						label="Linhas Afetadas"
						selected={realtimeDetailContext.data.form.values.references[index].child_ids}
						{...realtimeDetailContext.data.form.getInputProps(
							`references.${index}.child_ids`,
						)}
					/>
				</div>
				<div className={styles.buttonContainer}>
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
