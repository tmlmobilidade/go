'use client';

import { useAgenciesData } from '@/components/common/use-agencies-data';
import { useFareCreateContext } from '@/components/fares/create/FareCreate.context';
import { FareSchema } from '@tmlmobilidade/go-types-offer';
import { MultiSelect, Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function FareCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const fareCreateContext = useFareCreateContext();
	const { options: allAgencyOptions } = useAgenciesData();

	//
	// B. Render Components

	return (
		<Section gap="md">
			<TextInput
				label="Nome"
				placeholder="Ex: navegante® a bordo T1"
				required={!FareSchema.shape.name.isOptional()}
				w="100%"
				{...fareCreateContext.data.form.getInputProps('name')}
			/>

			<TextInput
				label="Código"
				placeholder="Ex: T1-BORDO"
				required={!FareSchema.shape.code.isOptional()}
				w="100%"
				{...fareCreateContext.data.form.getInputProps('code')}
			/>

			<MultiSelect
				key={fareCreateContext.data.form.key('agency_ids')}
				data={allAgencyOptions}
				label="Operadores"
				required={!FareSchema.shape.agency_ids.isOptional()}
				w="100%"
				{...fareCreateContext.data.form.getInputProps('agency_ids')}
			/>
		</Section>
	);

	//
}
