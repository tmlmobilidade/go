'use client';

/* * */

import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Combobox, Label, Section, Surface } from '@go/ui';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

export function RealtimeReferencesAgencies() {
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
					<RealtimeReferencesAgenciesItem key={index} index={index} />
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

	//
}

/* * */

function RealtimeReferencesAgenciesItem({ index }: { index: number }) {
	//

	//
	// A. Setup variables

	const realtimeDetailContext = useRealtimeDetailContext();

	//
	// B. Transform data

	const availableAgencies = useMemo(() => {
		return [{ label: 'Carris Metropolitana', value: 'CM' }];
	}, []);

	//
	// C. Render components

	return (
		<Surface>
			<Section gap="md">
				<Combobox
					aria-label="Agência Afetada"
					data={availableAgencies}
					label="Agência Afetada"
					clearable
					fullWidth
					{...realtimeDetailContext.data.form.getInputProps(
						`references.${index}.parent_id`,
					)}
				/>
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
