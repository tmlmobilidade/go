'use client';

/* * */

import Header from '@/components/common/Header';
import Row from '@/components/common/Row';
import Item from '@/components/common/Row/Item';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { Collapsible, Combobox, Grid, Section } from '@tmlmobilidade/ui';

import styles from '../styles.module.css';

/* * */

const comboBoxValues = ['AML', 'Alcochete'];

/* * */

interface AffectationProps {
	affectation: object
}

// export default function Affectation({ affectation }: AffectationProps) {
export default function Affectation() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description="Configuração dos passes aceites por esta paragem. É possível alterar estas definições para cada pattern."
			title="Afetação"
		>
			<Section gap="md">
				<Grid gap="md">
					<Combobox
						data={comboBoxValues}
						label="Aceitação de Passes pré-definida"
						multiple={true}
						placeholder="Escolha uma opção..."
						{...stopDetailContext.data.form.getInputProps('affectation')}
					/>
				</Grid>
			</Section>
		</Collapsible>

	);
}
