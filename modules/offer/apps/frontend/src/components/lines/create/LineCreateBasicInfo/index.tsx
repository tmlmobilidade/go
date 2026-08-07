'use client';

import { useLineCreateContext } from '@/components/lines/create/LineCreate.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { LineSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { Section, Select, TextInput, useDataAgenciesNew } from '@tmlmobilidade/ui';

/* * */

export function LineCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const lineCreateContext = useLineCreateContext();

	// Get agencies with create permission
	const { options: agencyOptions } = useDataAgenciesNew(API_ROUTES.offer.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.lines.actions.create],
		scope: PermissionCatalog.all.lines.scope,
	});

	//
	// B. Render components

	return (
		<Section gap="md">

			<TextInput
				key={lineCreateContext.data.form.key('name')}
				label="Nome"
				placeholder="Ex: Alfragide (Estr Seminario) - Reboleira (Estação)"
				required={!LineSchema.shape.name.isOptional()}
				w="100%"
				{...lineCreateContext.data.form.getInputProps('name')}
			/>

			<TextInput
				key={lineCreateContext.data.form.key('code')}
				label="Código"
				placeholder="Ex: 1001"
				required={!LineSchema.shape.code.isOptional()}
				w="100%"
				{...lineCreateContext.data.form.getInputProps('code')}
			/>

			<Select
				key={lineCreateContext.data.form.key('agency_id')}
				data={agencyOptions}
				label="Operador"
				required={!LineSchema.shape.agency_id.isOptional()}
				w="100%"
				{...lineCreateContext.data.form.getInputProps('agency_id')}
			/>

		</Section>
	);

	//
}
