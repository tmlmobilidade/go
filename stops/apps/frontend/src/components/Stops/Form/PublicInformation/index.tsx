'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { operationalStatusSchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Grid, Section, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function PublicInformation() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const operationalStatusItems = operationalStatusSchema.options.map (value => ({
		label: Translations.OPERATIONAL_STATUS[value],
		value: value,
	}));

	//
	// B. Render components

	return (
		<Collapsible
			description="Informação relacionadas com os suportes de informação ao público."
			title="Informação ao público"
		>
			<Section>
				<Grid columns="ab" gap="md">
					<Combobox
						data={operationalStatusItems}
						label="Tem Postalete?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<TextInput
						label="Entidade Gestora do Postalete"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('')}
					/>

				</Grid>
				<Spacer />
			</Section>

			<Section>
				<TextInput
					label="Tem Moldura?"
					miw="100%"
					placeholder="..."
					{...stopDetailContext.data.form.getInputProps('')}
				/>
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<Combobox
						data={operationalStatusItems}
						label="Tem PIP Áudio?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<TextInput
						disabled={!operationalStatusItems}
						label="Código do PIP Áudio"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Combobox
						data={operationalStatusItems}
						label="Tem PIP Realtime?"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<TextInput
						disabled={!operationalStatusItems}
						label="Código do PIP Realtime"
						placeholder="..."
						{...stopDetailContext.data.form.getInputProps('')}
					/>
				</Grid>
			</Section>

			<Section>
				<Combobox
					data={operationalStatusItems}
					label="Tem Sinalização H2OA?"
					placeholder="Escolha uma opção"
					fullWidth
					{...stopDetailContext.data.form.getInputProps('')}
				/>
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<Combobox
						data={operationalStatusItems}
						label="Tem Horários?"
						placeholder="Escolha uma opção"
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<Combobox
						data={operationalStatusItems}
						label="Tem Horários Táteis?"
						placeholder="Escolha uma opção"
						fullWidth
						{...stopDetailContext.data.form.getInputProps('')}
					/>
				</Grid>
			</Section>

			<Section>
				<Combobox
					data={operationalStatusItems}
					label="Tem Mapa de Rede?"
					placeholder="Escolha uma opção"
					fullWidth
					{...stopDetailContext.data.form.getInputProps('')}
				/>
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<TextInput
						label="Última Manutenção dos Horários?"
						miw="100%"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<TextInput
						label="Última Verificação dos Horários?"
						miw="100%"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<TextInput
						label="Última Manutenção do Postalete?"
						miw="100%"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
					<TextInput
						label="Última Manutenção do Postalete?"
						miw="100%"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('')}
					/>
				</Grid>
			</Section>

		</Collapsible>
	);

	//
}
