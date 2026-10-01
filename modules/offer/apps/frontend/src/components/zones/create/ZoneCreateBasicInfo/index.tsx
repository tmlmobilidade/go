'use client';

import { useAgenciesData } from '@/components/common/use-agencies-data';
import { useZoneCreateContext } from '@/components/zones/create/ZoneCreate.context';
import { ZoneSchema } from '@tmlmobilidade/go-types-offer';
import { MultiSelect, Section, TextInput } from '@tmlmobilidade/ui';
/* * */

export function ZoneCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const zoneCreateContext = useZoneCreateContext();
	const { options: allAgencyOptions } = useAgenciesData();

	//
	// B. Render Components

	return (
		<Section gap="md">
			<TextInput
				label="Nome"
				placeholder="Ex: Lisboa"
				required={!ZoneSchema.shape.name.isOptional()}
				w="100%"
				{...zoneCreateContext.data.form.getInputProps('name')}
			/>

			<TextInput
				label="Código"
				placeholder="Ex: 1101"
				required={!ZoneSchema.shape.code.isOptional()}
				w="100%"
				{...zoneCreateContext.data.form.getInputProps('code')}
			/>

			<MultiSelect
				key={zoneCreateContext.data.form.key('agency_ids')}
				data={allAgencyOptions}
				label="Operadores"
				required={!ZoneSchema.shape.agency_ids.isOptional()}
				w="100%"
				{...zoneCreateContext.data.form.getInputProps('agency_ids')}
			/>
		</Section>
	);

	//
}
