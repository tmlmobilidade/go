'use client';

import { useAgenciesData } from '@/components/common/use-agencies-data';
import { useTypologyCreateContext } from '@/components/typologies/create/TypologyCreate.context';
import { TypologySchema } from '@tmlmobilidade/go-types-offer';
import { MultiSelect, Section, TextInput } from '@tmlmobilidade/ui';
/* * */

export function TypologyCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const typologyCreateContext = useTypologyCreateContext();

	const { options: allAgencyOptions } = useAgenciesData();

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
}
