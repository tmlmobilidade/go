'use client';

/* * */

import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, Combobox, Label, Section, Surface } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

import styles from './styles.module.css';

/* * */

export function AlertReferencesAgencies() {
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
					<AlertReferencesAgenciesItem key={index} index={index} />
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

	//
}

/* * */

function AlertReferencesAgenciesItem({ index }: { index: number }) {
	//

	//
	// A. Setup variables

	const alertDetailContext = useAlertDetailContext();

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
					{...alertDetailContext.data.form.getInputProps(
						`references.${index}.parent_id`,
					)}
				/>
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
