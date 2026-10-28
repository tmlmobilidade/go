'use client';

import { useRouteCreateContext } from '@/components/routes/create/RouteCreate.context';
import { RouteSchema } from '@tmlmobilidade/go-types-offer';
import { Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';

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
			<StandardFormController
				control={routeCreateContext.form.control}
				name="code"
				render={({ field, fieldState }) => (
					<TextInput
						error={fieldState.error?.message}
						label="Código"
						placeholder="Ex: 1234_0"
						readOnly={!routeCreateContext.capabilities.editEnabled}
						required={!RouteSchema.shape.code.isOptional()}
						w="100%"
						{...field}
						value={field.value ?? ''}
					/>
				)}
			/>

			<StandardFormController
				control={routeCreateContext.form.control}
				name="name"
				render={({ field, fieldState }) => (
					<TextInput
						error={fieldState.error?.message}
						label="Nome"
						placeholder="Ex: Alfragide (Estr Seminario) - Reboleira (Estação)"
						readOnly={!routeCreateContext.capabilities.editEnabled}
						required={!RouteSchema.shape.name.isOptional()}
						w="100%"
						{...field}
						value={field.value ?? ''}
					/>
				)}
			/>
		</Section>
	);

	//
}
