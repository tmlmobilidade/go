'use client';

import { useTypologyCreateContext } from '@/components/typologies/create/TypologyCreate.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog, TypologySchema } from '@tmlmobilidade/types';
import { MultiSelect, Section, TextInput, useDataAgenciesNew } from '@tmlmobilidade/ui';
/* * */

export function TypologyCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const typologyCreateContext = useTypologyCreateContext();

	const { options: allAgencyOptions } = useDataAgenciesNew(API_ROUTES.offer.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.typologies.actions.create],
		scope: PermissionCatalog.all.typologies.scope,
	});

	//
	// B. Render Components

	return (
		<Section gap="md">
			<TextInput
				label="Nome"
				placeholder="Ex: Linha Longa"
				required={!TypologySchema.shape.name.isOptional()}
				w="100%"
				{...typologyCreateContext.data.form.getInputProps('name')}
			/>

			<TextInput
				label="Código"
				placeholder="Ex: LONGA"
				required={!TypologySchema.shape.code.isOptional()}
				w="100%"
				{...typologyCreateContext.data.form.getInputProps('code')}
			/>

			<MultiSelect
				key={typologyCreateContext.data.form.key('agency_ids')}
				data={allAgencyOptions}
				label="Operadores"
				required={!TypologySchema.shape.agency_ids.isOptional()}
				w="100%"
				{...typologyCreateContext.data.form.getInputProps('agency_ids')}
			/>
		</Section>
	);

	//
}
