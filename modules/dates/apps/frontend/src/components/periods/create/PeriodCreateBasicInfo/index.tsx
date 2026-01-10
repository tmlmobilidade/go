'use client';

/* * */

import { usePeriodCreateContext } from '@/components/periods/create/PeriodsCreate.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { PeriodSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { ColorInput, Section, Select, TextInput, useDataAgencies } from '@tmlmobilidade/ui';

/* * */

export function PeriodCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const periodCreateContext = usePeriodCreateContext();

	const { options: allAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.periods.actions.create],
		scope: PermissionCatalog.all.periods.scope,
	});

	//
	// B. Render Components

	return (
		<Section gap="md">
			<TextInput
				label="Nome"
				placeholder="Ex: Período Escolar 2024/2025"
				required={!PeriodSchema.shape.name.isOptional()}
				w="100%"
				{...periodCreateContext.data.form.getInputProps('name')}
			/>

			<Select
				data={allAgencyOptions}
				label="Operador"
				w="100%"
				{...periodCreateContext.data.form.getInputProps('agency_id')}
			/>

			<ColorInput
				label="Cor"
				required={!PeriodSchema.shape.color.isOptional()}
				withEyeDropper={false}
				{...periodCreateContext.data.form.getInputProps('color')}
			/>
		</Section>
	);

	//
}
