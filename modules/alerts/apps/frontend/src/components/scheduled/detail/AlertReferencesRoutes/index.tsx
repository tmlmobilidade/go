'use client';

/* * */

import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { useLinesContext } from '@/contexts/Lines.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { IconCornerDownRight, IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Combobox, Label, MultiSelect, Section, Surface } from '@go/ui';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

export function AlertReferencesLines() {
	//

	//
	// A. Setup variables

	const alertDetailContext = useAlertDetailContext();

	//
	// B. Transform data

	const references = useMemo(
		() => alertDetailContext.data.form.values.references,
		[alertDetailContext.data.form.values.references],
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
					<AlertReferencesLinesItem key={index} index={index} />
				))
			)}
			<Button
				className={styles.button}
				icon={<IconPlus size={18} />}
				label="Adicionar Rota"
				onClick={alertDetailContext.actions.addReference}
				variant="primary"
			/>
		</div>
	);
}

/* * */

function AlertReferencesLinesItem({ index }: { index: number }) {
	//

	//
	// A. Setup variables

	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();
	const alertDetailContext = useAlertDetailContext();

	//
	// B. Transform data

	const availableLines = useMemo(() => {
		if (!linesContext.data.lines) return [];

		if (alertDetailContext.data.form.values.municipality_ids.length === 0)
			return linesContext.data.lines.map(line => ({
				label: `[${line.id}] ${line.long_name}`,
				value: line.id,
			}));

		return linesContext.data.lines
			.filter(line =>
				line.municipality_ids.some((municipality: string) =>
					alertDetailContext.data.form.values.municipality_ids.includes(
						municipality,
					),
				),
			)
			.map(line => ({
				label: `[${line.id}] ${line.long_name}`,
				value: line.id,
			}));
	}, [linesContext.data.lines, alertDetailContext.data.form.values.municipality_ids]);

	const availableStops = useMemo(() => {
		if (!stopsContext.data.stops) return [];
		if (!alertDetailContext.data.form.values.references[index].parent_id)
			return [];

		return stopsContext.data.stops
			.filter(stop =>
				stop.line_ids.includes(
					alertDetailContext.data.form.values.references[index].parent_id,
				),
			)
			.map(stop => ({
				label: `[${stop.id}] ${stop.long_name}`,
				value: stop.id,
			}));
	}, [
		stopsContext.data.stops,
		alertDetailContext.data.form.values.references[index].parent_id,
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
					{...alertDetailContext.data.form.getInputProps(`references.${index}.parent_id`)}
				/>
				<div className={styles.childrenWrapper}>
					<IconCornerDownRight className={styles.icon} size={28} />
					<MultiSelect
						aria-label="Paragens Afetadas"
						data={availableStops}
						description="Selecione as paragens que serão afetadas pelo alerta"
						label="Paragens Afetadas"
						selected={alertDetailContext.data.form.values.references[index].child_ids}
						{...alertDetailContext.data.form.getInputProps(
							`references.${index}.child_ids`,
						)}
					/>
				</div>
				<div className={styles.deleteButtonWrapper}>
					<Button
						className={styles.button}
						icon={<IconTrash size={18} />}
						label="Eliminar"
						onClick={() => alertDetailContext.actions.removeReference(index)}
						variant="danger"
					/>
				</div>
			</Section>
		</Surface>
	);

	//
}
