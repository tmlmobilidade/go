/* * */

import { useAgenciesData } from '@/components/common/use-agencies-data';
import { useLineDetailContext } from '@/components/lines/detail/LineDetail.context';
import { LineSchema, TransportTypeValues } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Collapsible, Grid, Section, Select, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';
/* * */

export function LineDetailSectionConfig() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const lineDetailContext = useLineDetailContext();
	const { options: agencyOptions } = useAgenciesData({ permissions: { actions: [lineDetailContext.capabilities.editEnabled ? PermissionCatalog.all.lines.actions.update : PermissionCatalog.all.lines.actions.read], scope: PermissionCatalog.all.lines.scope } });

	//
	// B. Render components

	return (
		<Collapsible title={t('lines:detail.LineDetailSectionConfig.line_config')} defaultOpen>
			<Section gap="sm">
				<StandardFormController
					control={lineDetailContext.form.control}
					name="code"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label={t('lines:detail.LineDetailSectionConfig.code')}
							placeholder={t('lines:detail.LineDetailSectionConfig.code_example')}
							readOnly={!lineDetailContext.capabilities.editEnabled}
							required={!LineSchema.shape.code.isOptional()}
							w="100%"
							{...field}
							value={field.value ?? ''}
						/>
					)}
				/>

				<StandardFormController
					control={lineDetailContext.form.control}
					name="name"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label={t('lines:detail.LineDetailSectionConfig.name')}
							placeholder={t('lines:detail.LineDetailSectionConfig.code_example')}
							readOnly={!lineDetailContext.capabilities.editEnabled}
							required={!LineSchema.shape.name.isOptional()}
							w="100%"
							{...field}
							value={field.value ?? ''}
						/>
					)}
				/>

				<Grid columns="ab" gap="sm">
					<StandardFormController
						control={lineDetailContext.form.control}
						name="agency_id"
						render={({ field, fieldState }) => (
							<Select
								data={agencyOptions}
								error={fieldState.error?.message}
								label={t('lines:detail.LineDetailSectionConfig.agency')}
								readOnly={!lineDetailContext.capabilities.editEnabled}
								required={!LineSchema.shape.agency_id.isOptional()}
								w="100%"
								{...field}
								value={field.value ?? null}
							/>
						)}
					/>

					<StandardFormController
						control={lineDetailContext.form.control}
						name="transport_type"
						render={({ field, fieldState }) => (
							<Select
								data={TransportTypeValues.map(value => ({ label: t(`lines:detail.LineDetailSectionConfig.transport_options.${value}`), value }))}
								error={fieldState.error?.message}
								label={t('lines:detail.LineDetailSectionConfig.vehicle_type')}
								readOnly={!lineDetailContext.capabilities.editEnabled}
								required={!LineSchema.shape.transport_type.isOptional()}
								w="100%"
								{...field}
								value={field.value ?? null}
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
