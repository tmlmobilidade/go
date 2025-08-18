'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { hasAnySchema, roadTypeSchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Grid, Section, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function Infraestructures() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	const has_this = hasAnySchema.options.map (value => ({
		label: Translations.HAS_ANY[value],
		value: value,
	}));

	const road_relation = roadTypeSchema.options.map (value => ({
		label: Translations.ROAD_TYPE[value],
		value: value,
	}));

	//
	// B. Render components

	return (
		<Collapsible
			description="Informações relacionadas com os equipamentos da paragem e envolvente."
			title="Infraestrutura"
		>
			<Section>
				<Grid columns="ab" gap="md">
					<Combobox
						data={has_this}
						label="Existe Mupi?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('has_mupi')}
					/>
					<Combobox
						data={has_this}
						label="Existe Banco?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('has_bench')}
					/>
					<Combobox
						data={has_this}
						label="Existe Iluminação?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('has_lighting')}
					/>
					<Combobox
						data={has_this}
						label="Existe Ligação Elétrica?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('has_electricity')}
					/>
				</Grid>
				<Spacer />
			</Section>

			<Section>
				<Combobox
					data={road_relation}
					label="Tipo de Relação com a Via"
					placeholder="..."
					fullWidth
					{...stopDetailContext.data.form.getInputProps('road_type')}
				/>
				<Spacer />
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<TextInput
						label="Última Manutenção da Infraestrutura"
						miw="100%"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('last_infrastructure_maintenance')}
					/>
					<TextInput
						label="Última Verificação da Infraestrutura"
						miw="100%"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('last_infrastructure_check')}
					/>
				</Grid>
				<Spacer />
			</Section>
		</Collapsible>
	);

	//
}
