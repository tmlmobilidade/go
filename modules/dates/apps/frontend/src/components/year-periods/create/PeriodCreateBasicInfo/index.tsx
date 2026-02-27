'use client';

/* * */

import { usePeriodCreateContext } from '@/components/year-periods/create/PeriodsCreate.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog, YearPeriodSchema } from '@tmlmobilidade/types';
import { ColorInput, MultiSelect, Section, TextInput, useDataAgencies } from '@tmlmobilidade/ui';

/* * */

export function PeriodCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const periodCreateContext = usePeriodCreateContext();

	const { options: allAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.year_periods.actions.create],
		scope: PermissionCatalog.all.year_periods.scope,
	});

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
