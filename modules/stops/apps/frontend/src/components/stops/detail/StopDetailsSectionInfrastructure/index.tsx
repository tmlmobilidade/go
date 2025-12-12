'use client';

/* * */

import { useStopDetailContext } from '@/contexts/StopDetails.context';
import { Translations } from '@/lib/translations';
import { hasAnySchema, roadTypeSchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, Select, Spacer, TextInput } from '@tmlmobilidade/ui';

/* * */

export function StopDetailsSectionInfrastructure() {
	//

	//
	// A. Setup variables

	const stopDetailContext = useStopDetailContext();

	//
	// B. Transform data

	const hasThisOptions = hasAnySchema.options.map(value => ({
		label: Translations.HAS_ANY[value],
		value: value,
	}));

	const roadTypeOptions = roadTypeSchema.options.map(value => ({
		label: Translations.ROAD_TYPE[value],
		value: value,
	}));

	//
	// C. Render components

	return (
		<Collapsible
			description="Informações relacionadas com os equipamentos da paragem e envolvente."
			title="Infraestrutura"
		>
			<Section>
				<Grid columns="ab" gap="md">
					<Select
						key={stopDetailContext.data.form.key('has_mupi')}
						data={hasThisOptions}
						label="Existe Mupi?"
						{...stopDetailContext.data.form.getInputProps('has_mupi')}
					/>
					<Select
						key={stopDetailContext.data.form.key('has_bench')}
						data={hasThisOptions}
						label="Existe Banco?"
						{...stopDetailContext.data.form.getInputProps('has_bench')}
					/>
					<Select
						key={stopDetailContext.data.form.key('has_lighting')}
						data={hasThisOptions}
						label="Existe Iluminação?"
						{...stopDetailContext.data.form.getInputProps('has_lighting')}
					/>
					<Select
						key={stopDetailContext.data.form.key('has_electricity')}
						data={hasThisOptions}
						label="Existe Ligação Elétrica?"
						{...stopDetailContext.data.form.getInputProps('has_electricity')}
					/>
				</Grid>
				<Spacer />
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<Select
						key={stopDetailContext.data.form.key('road_type')}
						data={roadTypeOptions}
						label="Tipo de Relação com a Via"
						{...stopDetailContext.data.form.getInputProps('road_type')}
					/>
				</Grid>
			</Section>

			<Section>
				<Grid columns="ab" gap="md">
					<TextInput
						key={stopDetailContext.data.form.key('last_infrastructure_maintenance')}
						label="Última Manutenção da Infraestrutura"
						placeholder="2023-02-10"
						{...stopDetailContext.data.form.getInputProps('last_infrastructure_maintenance')}
					/>
					<TextInput
						key={stopDetailContext.data.form.key('last_infrastructure_check')}
						label="Última Verificação da Infraestrutura"
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
