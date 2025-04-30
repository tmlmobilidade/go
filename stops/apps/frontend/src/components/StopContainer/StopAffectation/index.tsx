'use client';

import { useStopDetailContext } from '@/contexts/StopDetail.context';
import { Collapsible, Combobox, Grid, Section } from '@tmlmobilidade/ui';

/* * */

const comboBoxValues = ['AML', 'Alcochete'];

/* * */

export default function StopAffectation() {
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
