'use client';

import { useStopsDetailContext } from '@/contexts/StopsDetail.context';
import { Collapsible, Grid, Section, TextArea } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function StopObservations() {
	//

	const stopDetailsContext = useStopsDetailContext();
	//
	// A. Render components

	return (
		<Collapsible
			description="Texto livre para informações adicionais."
			title="Observações"
		>
			<Section gap="md">
				<Grid columns="a" gap="md">
					<TextArea
						className={styles.textArea}
						maxRows={10}
						minRows={4}
						placeholder="Construção planeada a..."
						{...stopDetailsContext.data.form.getInputProps('observations')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
