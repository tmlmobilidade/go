'use client';

/* * */

import { useEventCreateContext } from '@/components/events/create/EventCreate.context';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { EventSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { MultiSelect, Section, Textarea, TextInput, useDataAgencies } from '@tmlmobilidade/ui';

/* * */

export function EventCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const eventCreateContext = useEventCreateContext();

	const { options: allAgencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST, {
		actions: [PermissionCatalog.all.events.actions.create],
		scope: PermissionCatalog.all.events.scope,
	});

	//
	// B. Render Components

	return (
		<Section gap="md">
			<TextInput
				key={eventCreateContext.data.form.key('title')}
				label="Título"
				placeholder="Ex: Maratona de Lisboa"
				required={!EventSchema.shape.title.isOptional()}
				w="100%"
				{...eventCreateContext.data.form.getInputProps('title')}
			/>

			<Textarea
				key={eventCreateContext.data.form.key('description')}
				label="Descrição"
				minRows={2}
				placeholder="Descreva o evento..."
				required={!EventSchema.shape.description.isOptional()}
				w="100%"
				{...eventCreateContext.data.form.getInputProps('description')}
			/>

			<MultiSelect
				key={eventCreateContext.data.form.key('agency_ids')}
				data={allAgencyOptions}
				label="Operadores afetados"
				w="100%"
				{...eventCreateContext.data.form.getInputProps('agency_ids')}
			/>
		</Section>
	);

	//
}
