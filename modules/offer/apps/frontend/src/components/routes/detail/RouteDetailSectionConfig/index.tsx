/* * */

import { useRouteDetailContext } from '@/components/routes/detail/RouteDetail.context';
import { RoutePathTypeValues, RouteSchema } from '@tmlmobilidade/go-types-offer';
import { Collapsible, Section, Select, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function RouteDetailSectionConfig() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const routeDetailContext = useRouteDetailContext();

	//
	// B. Render components

	return (
		<Collapsible title={t('routes:detail.RouteDetailSectionConfig.route_config')} defaultOpen>
			<Section gap="sm">
				<StandardFormController
					control={routeDetailContext.form.control}
					name="code"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label={t('routes:detail.RouteDetailSectionConfig.code')}
							placeholder={t('routes:detail.RouteDetailSectionConfig.code_example')}
							readOnly={!routeDetailContext.capabilities.editEnabled}
							required={!RouteSchema.shape.code.isOptional()}
							w="100%"
							{...field}
							value={field.value ?? ''}
						/>
					)}
				/>

				<StandardFormController
					control={routeDetailContext.form.control}
					name="name"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label={t('routes:detail.RouteDetailSectionConfig.name')}
							placeholder={t('routes:detail.RouteDetailSectionConfig.line_example')}
							readOnly={!routeDetailContext.capabilities.editEnabled}
							required={!RouteSchema.shape.name.isOptional()}
							w="100%"
							{...field}
							value={field.value ?? ''}
						/>
					)}
				/>

				<StandardFormController
					control={routeDetailContext.form.control}
					name="path_type"
					render={({ field, fieldState }) => (
						<Select
							data={RoutePathTypeValues.map(value => ({ label: t(`routes:detail.RouteDetailSectionConfig.path_options.${value}`), value }))}
							error={fieldState.error?.message}
							label={t('routes:detail.RouteDetailSectionConfig.path_type')}
							readOnly={!routeDetailContext.capabilities.editEnabled}
							required={!RouteSchema.shape.path_type.isOptional()}
							w="100%"
							{...field}
							value={field.value ?? null}
						/>
					)}
				/>
			</Section>
		</Collapsible>
	);

	//
}
