'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { hasAnySchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, Select, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionPublicInformation() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Transform data

	const hasThisOptions = hasAnySchema.options.map (value => ({
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
					<Select
						key={stopDetailContext.data.form.key('has_stop_sign')}
						data={hasThisOptions}
						label="Tem Postalete?"
						{...stopDetailContext.data.form.getInputProps('has_stop_sign')}
					/>
					<Select
						key={stopDetailContext.data.form.key('has_schedules')}
						data={hasThisOptions}
						label="Tem Horários?"
						{...stopDetailContext.data.form.getInputProps('has_schedules')}
					/>
					<Select
						key={stopDetailContext.data.form.key('has_network_map')}
						data={hasThisOptions}
						label="Tem Mapa de Rede?"
						{...stopDetailContext.data.form.getInputProps('has_network_map')}
					/>
				</Grid>
				<Spacer />
			</Section>
			<Section>
				<Grid columns="ab" gap="md">
					<TextInput
						key={stopDetailContext.data.form.key('last_schedules_maintenance')}
						label="Última Manutenção dos Horários?"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('last_schedules_maintenance')}
					/>
					<TextInput
						key={stopDetailContext.data.form.key('last_schedules_check')}
						label="Última Verificação dos Horários?"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('last_schedules_check')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
