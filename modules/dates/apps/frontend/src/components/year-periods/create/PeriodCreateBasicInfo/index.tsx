'use client';

import { useAnnotationsAgenciesData } from '@/components/annotations/shared/use-users-agencies-data';
import { usePeriodCreateContext } from '@/components/year-periods/create/PeriodsCreate.context';
import { YearPeriodSchema } from '@tmlmobilidade/go-types-offer';
import { ColorInput, MultiSelect, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function PeriodCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const periodCreateContext = usePeriodCreateContext();

	const { options: allAgencyOptions } = useAnnotationsAgenciesData();

	//
	// B. Render Components

	return (
		<Section gap="md">
			<TextInput
				label="Nome"
				placeholder="Ex: Período Escolar 2024/2025"
				required={!YearPeriodSchema.shape.name.isOptional()}
				w="100%"
				{...periodCreateContext.data.form.getInputProps('name')}
			/>

			<MultiSelect
				data={allAgencyOptions}
				label="Operadores"
				w="100%"
				{...periodCreateContext.data.form.getInputProps('agency_ids')}
			/>

			<ColorInput
				label="Cor"
				required={!YearPeriodSchema.shape.color.isOptional()}
				withEyeDropper={false}
				{...periodCreateContext.data.form.getInputProps('color')}
			/>
		</Section>
	);

	//
}
