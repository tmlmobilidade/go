'use client';

/* * */

import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { useLinesContext } from '@/contexts/Lines.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { IconCornerDownRight, IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Combobox, Label, Section, Surface } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

export function AlertReferencesStops() {
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
				references.map((reference, index) => (
					<AlertReferencesStopsItem key={index} index={index} />
				))
			)}
			<Button
				className={styles.button}
				icon={<IconPlus size={18} />}
				label="Adicionar Paragem"
				onClick={alertDetailContext.actions.addReference}
				variant="primary"
			/>
		</div>
	);

	//
}

function AlertReferencesStopsItem({ index }: { index: number }) {
	//

	//
	// A. Setup variables

	const linesContext = useLinesContext();
	const stopsContext = useStopsContext();
	const alertDetailContext = useAlertDetailContext();

	//
	// B. Transform data

	const availableStops = useMemo(() => {
		if (!stopsContext.data.stops) return [];
		if (!alertDetailContext.data.form.values.municipality_ids) return [];

		return stopsContext.data.stops
			.filter(stop =>
				alertDetailContext.data.form.values.municipality_ids.includes(
					stop.municipality_id,
				),
			)
			.map(stop => ({
				label: `[${stop.id}] ${stop.long_name}`,
				value: stop.id,
			}));
	}, [stopsContext.data.stops, alertDetailContext.data.form.values.municipality_ids]);

	const availableRoutes = useMemo(() => {
		if (!linesContext.data.lines) return [];
		if (!alertDetailContext.data.form.values.references[index].parent_id)
			return [];

		const selectedStop = stopsContext.data.stops.find(
			stop =>
				stop.id
				=== alertDetailContext.data.form.values.references[index].parent_id,
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
		alertDetailContext.data.form.values.municipality_ids,
		alertDetailContext.data.form.values.references[index].parent_id,
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
					placeholder={alertDetailContext.data.form.values.municipality_ids.length === 0 ? 'Selecione os Municípios' : 'Selecione a Paragem'}
					clearable
					fullWidth
					searchable
					{...alertDetailContext.data.form.getInputProps(`references.${index}.parent_id`)}
				/>
				<div className={styles.childrenWrapper}>
					<IconCornerDownRight className={styles.icon} size={28} />
					<Combobox
						aria-label="Linhas Afetadas"
						data={availableRoutes}
						description="Selecione as linhas que serão afetadas pelo alerta"
						label="Linhas Afetadas"
						clearable
						fullWidth
						multiple
						searchable
						{...alertDetailContext.data.form.getInputProps(
							`references.${index}.child_ids`,
						)}
					/>
				</div>
				<div className={styles.buttonContainer}>
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
