'use client';

import { Collapsible, Combobox, Grid, Section } from '@tmlmobilidade/ui';

/* * */

const comboBoxValues = ['AML', 'Alcochete'];

/* * */

export function StopAffectation({ data }) {
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
						{...data.form.getInputProps('affectation')}
					/>
				</Grid>
			</Section>
		</Collapsible>

	);
}
