'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { hasAnySchema, pavementTypeSchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Grid, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function Accessibility() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const has_this = hasAnySchema.options.map (value => ({
		label: Translations.HAS_ANY[value],
		value: value,
	}));

	const sidewalkTypeOptions = pavementTypeSchema.options.map (value => ({
		label: Translations.PAVEMENT_TYPE[value],
		value: value,
	}));

	//
	// B. Render components

	return (
		<Collapsible
			description="Informações sobre a acessiilidade da paragem e sua envolvente."
			title="Acessibilidade"
		>
			<Section>
				<Grid columns="abc" gap="md">
					<Combobox
						data={has_this}
						label="Tem Passeio?"
						placeholder="Escolha uma opção"
						fullWidth
						{...stopDetailContext.data.form.getInputProps('has_sidewalk')}
					/>
					<Combobox
						data={sidewalkTypeOptions}
						disabled={!has_this}
						label="Tipo de Passeio?"
						placeholder="Escolha uma opção"
						fullWidth
						{...stopDetailContext.data.form.getInputProps('sidewalk_type')}
					/>
				</Grid>
			</Section>

			<Section>
				<Grid columns="abcd" gap="sm">
					<Combobox
						data={has_this}
						label="Tem Passadeira?"
						placeholder="Escolha uma opção"
						fullWidth
						{...stopDetailContext.data.form.getInputProps('has_crosswalk')}
					/>
					<Combobox
						data={has_this}
						label="Tem Acesso Rebaixado/Contínuo?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Combobox
						data={has_this}
						label="Tem Acesso Largo"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Combobox
						data={has_this}
						label="Tem Pavimento Tátil?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('has_tactile_paving')}
					/>
				</Grid>
			</Section>
			<Section>
				<Grid columns="ab" gap="md">
					<Combobox
						data={has_this}
						label="Tem Estacionamento Abusivo?"
						placeholder="Escolha uma opção"
						fullWidth
						{...stopDetailContext.data.form.getInputProps('has_abusive_parking')}
					/>
					<Combobox
						data={has_this}
						label="Permite Embarque de PMR?"
						placeholder="Escolha uma opção"
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<TextInput
						label="Última Manutenção da Acessibilidade?"
						miw="100%"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<TextInput
						label="Última Verificação da Acessibilidade?"
						miw="100%"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('last_accessibility_check')}
					/>
				</Grid>
			</Section>

		</Collapsible>
	);

	//
}
