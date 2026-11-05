'use client';

import { useRouteCreateContext } from '@/components/routes/create/RouteCreate.context';
import { RouteSchema } from '@tmlmobilidade/go-types-offer';
import { Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RouteCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
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
						label={t('routes:create.RouteCreateBasicInfo.code')}
						placeholder={t('routes:create.RouteCreateBasicInfo.code_example')}
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
						label={t('routes:create.RouteCreateBasicInfo.name')}
						placeholder={t('routes:create.RouteCreateBasicInfo.line_example')}
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
