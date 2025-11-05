'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { hasAnySchema } from '@go/types';
import { Collapsible, Combobox, Grid, Section, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionPublicInformation() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Transform data

	const has_this = hasAnySchema.options.map (value => ({
		label: Translations.HAS_ANY[value],
		value: value,
	}));

	//
	// C. Render components

	return (
		<Collapsible
			description="Informação relacionadas com os suportes de informação ao público."
			title="Informação ao público"
		>
			<Section>
				<Grid columns="a" gap="md">
					<Combobox
						data={has_this}
						label="Tem Postalete?"
						placeholder="..."
						fullWidth
						{...stopDetailContext.data.form.getInputProps('has_stop_sign')}
					/>
					<Combobox
						data={has_this}
						label="Tem Horários?"
						placeholder="Escolha uma opção"
						fullWidth
						{...stopDetailContext.data.form.getInputProps('has_schedules')}
					/>
					<Combobox
						data={has_this}
						label="Tem Mapa de Rede?"
						placeholder="Escolha uma opção"
						fullWidth
						{...stopDetailContext.data.form.getInputProps('has_network_map')}
					/>
				</Grid>
				<Spacer />
			</Section>
			<Section>
				<Grid columns="ab" gap="md">
					<TextInput
						label="Última Manutenção dos Horários?"
						miw="100%"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('last_schedules_maintenance')}
					/>
					<TextInput
						label="Última Verificação dos Horários?"
						miw="100%"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('last_schedules_check')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
