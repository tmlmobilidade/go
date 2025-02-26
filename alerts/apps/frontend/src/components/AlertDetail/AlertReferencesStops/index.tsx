'use client';

import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { useLinesContext } from '@/contexts/Lines.context';
import { useStopsContext } from '@/contexts/Stops.context';
import { IconCornerDownRight, IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Combobox, Surface } from '@tmlmobilidade/ui';
import { useEffect, useMemo, useState } from 'react';

import styles from './styles.module.css';

export default function AlertReferencesStops() {
	//
	// A. Get Data
	const alertDetailContext = useAlertDetailContext();

	const references = useMemo(
		() => alertDetailContext.data.form.values.references,
		[alertDetailContext.data.form.values.references],
	);

	//
	// C. Render Components
	return (
		<div className={styles.container}>
			{references.length === 0 ? (
				<Surface className={styles.empty} padding="md">
					Não há referências disponíveis.
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
}

function AlertReferencesStopsItem({ index }: { index: number }) {
	//

	//
	// A. Setup variables
	const { data: linesData } = useLinesContext();
	const { data: stopsData } = useStopsContext();
	const { actions, data: alertDetailsData } = useAlertDetailContext();

	const [stopSearch, setStopSearch] = useState(
		'hello',
	);

	//
	// B. Transform data
	const availableStops = useMemo(() => {
		if (!stopsData.stops) return [];
		if (!alertDetailsData.form.values.municipality_ids) return [];

		// if (alertDetailsData.form.values.municipality_ids.length === 0) {
		// 	return stopsData.stops.map(stop => ({
		// 		label: `[${stop.id}] ${stop.long_name}`,
		// 		value: stop.id,
		// 	}));
		// }

		return stopsData.stops
			.filter(stop =>
				alertDetailsData.form.values.municipality_ids.includes(
					stop.municipality_id,
				),
			)
			.map(stop => ({
				label: `[${stop.id}] ${stop.long_name}`,
				value: stop.id,
			}));
	}, [stopsData.stops, alertDetailsData.form.values.municipality_ids]);

	const availableRoutes = useMemo(() => {
		if (!linesData.routes) return [];
		if (!alertDetailsData.form.values.references[index].parent_id)
			return [];

		const selectedStop = stopsData.stops.find(
			stop =>
				stop.id
				=== alertDetailsData.form.values.references[index].parent_id,
		);
		return (
			selectedStop?.route_ids.map(routeId => ({
				label: `[${routeId}] ${
					linesData.routes.find(route => route.id === routeId)
						?.long_name
				}`,
				value: routeId,
			})) || []
		);
	}, [
		linesData.routes,
		alertDetailsData.form.values.municipality_ids,
		alertDetailsData.form.values.references[index].parent_id,
	]);

	useEffect(() => {
		console.log('Form Values', alertDetailsData.form.values);
	}, [alertDetailsData.form.values]);

	//
	// C. Render Components

	return (
		<Surface borderRadius="sm" classNames={styles} gap="md" padding="sm">
			<Combobox
				aria-label="Paragem Afetada"
				data={availableStops}
				label="Paragem Afetada"
				clearable
				fullWidth
				searchable
				{...(() => {
					const { value, ...inputProps } = alertDetailsData.form.getInputProps(
						`references.${index}.parent_id`,
					);
					return inputProps;
				})()}
			/>
			<div className={styles.childrenWrapper}>
				<IconCornerDownRight className={styles.icon} size={28} />
				<Combobox
					aria-label="Linhas Afetadas"
					data={availableRoutes}
					description="Selecione as linhas que serão afetadas pelo alerta"
					label="Rotas Afetadas"
					clearable
					fullWidth
					multiple
					searchable
					{...alertDetailsData.form.getInputProps(
						`references.${index}.child_ids`,
					)}
				/>
			</div>
			<div className={styles.buttonContainer}>
				<Button
					className={styles.button}
					icon={<IconTrash size={18} />}
					label="Eliminar"
					onClick={() => actions.removeReference(index)}
					variant="danger"
				/>
			</div>
		</Surface>
	);
}
