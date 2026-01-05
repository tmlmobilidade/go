'use client';

/* * */

import { useZoneCreateContext } from '@/components/zones/create/ZoneCreate.context';
import { PermissionCatalog, ZoneSchema } from '@tmlmobilidade/types';
import { MultiSelect, Section, TextInput, useDataAgencies } from '@tmlmobilidade/ui';

/* * */

export function ZoneCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const zoneCreateContext = useZoneCreateContext();
	const { options: allAgencyOptions } = useDataAgencies(PermissionCatalog.all.zones.scope, PermissionCatalog.all.zones.actions.create);

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
