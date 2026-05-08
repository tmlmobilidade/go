'use client';

import { useRouteCreateContext } from '@/components/routes/create/RouteCreate.context';
import { RouteSchema } from '@tmlmobilidade/types';
import { Section, TextInput } from '@tmlmobilidade/ui';

/* * */

export function RouteCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const routeCreateContext = useRouteCreateContext();

	//
	// B. Render components

	return (
		<Section gap="md">
			<TextInput
				key={routeCreateContext.data.form.key('code')}
				label="Código"
				placeholder="Ex: 1234_0"
				required={!RouteSchema.shape.code.isOptional()}
				w="100%"
				{...routeCreateContext.data.form.getInputProps('code')}
			/>

			<TextInput
				key={routeCreateContext.data.form.key('name')}
				label="Nome"
				placeholder="Ex: Alfragide (Estr Seminario) - Reboleira (Estação)"
				required={!RouteSchema.shape.name.isOptional()}
				w="100%"
				{...routeCreateContext.data.form.getInputProps('name')}
			/>
		</Section>
	);

	//
}
