'use client';

import { CreateZoneSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Collapsible, ErrorDisplay, MultiSelect, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useZonesAgenciesData } from '../../shared/use-zones-agencies-data';
import { useZonesDetailFormContext } from '../ZonesDetailForm.context';

/* * */

export function ZoneDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useZonesDetailFormContext();
	const { error, isLoading, options } = useZonesAgenciesData({ permissions: capabilities.editEnabled ? { actions: [PermissionCatalog.all.zones.actions.update], scope: PermissionCatalog.all.zones.scope } : undefined });

	//
	// B. Render components

	return (
		<Collapsible title={t('default:zones.sections.basic')} defaultOpen>
			<Section gap="md">
				{error && <ErrorDisplay message={error} />}

				<StandardFormController
					control={form.control}
					name="name"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label={t('default:zones.fields.name.label')}
							maxLength={CreateZoneSchema.shape.name.maxLength}
							onChange={field.onChange}
							placeholder={t('default:zones.fields.name.placeholder')}
							readOnly={!capabilities.editEnabled}
							value={field.value ?? ''}
							w="100%"
							withAsterisk={!CreateZoneSchema.shape.name.isOptional()}
						/>
					)}
				/>

				<StandardFormController
					control={form.control}
					name="code"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label={t('default:zones.fields.code.label')}
							maxLength={CreateZoneSchema.shape.code.maxLength}
							onChange={field.onChange}
							placeholder={t('default:zones.fields.code.placeholder')}
							readOnly={!capabilities.editEnabled}
							value={field.value ?? ''}
							w="100%"
							withAsterisk={!CreateZoneSchema.shape.code.isOptional()}
						/>
					)}
				/>

				<StandardFormController
					control={form.control}
					name="agency_ids"
					render={({ field, fieldState }) => (
						<MultiSelect
							data={options}
							disabled={!capabilities.editEnabled || isLoading || !!error}
							error={fieldState.error?.message}
							label={t('default:zones.fields.agency_ids.label')}
							onChange={field.onChange}
							value={field.value ?? []}
							w="100%"
							withAsterisk={!CreateZoneSchema.shape.agency_ids.isOptional()}
						/>
					)}
				/>
			</Section>
		</Collapsible>
	);
}
