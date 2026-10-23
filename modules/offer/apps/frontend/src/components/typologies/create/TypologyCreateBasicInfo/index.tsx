'use client';

import { CreateTypologySchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ErrorDisplay, MultiSelect, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useTypologiesAgenciesData } from '../../shared/use-typologies-agencies-data';
import { useTypologiesCreateFormContext } from '../TypologiesCreateForm.context';

/* * */

export function TypologyCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useTypologiesCreateFormContext();
	const { error, isLoading, options } = useTypologiesAgenciesData({ permissions: { actions: [PermissionCatalog.all.typologies.actions.create], scope: PermissionCatalog.all.typologies.scope } });

	//
	// B. Render components

	return (
		<Section gap="md">
			{error && <ErrorDisplay message={error} />}

			<StandardFormController
				control={form.control}
				name="name"
				render={({ field, fieldState }) => (
					<TextInput
						error={fieldState.error?.message}
						label={t('default:typologies.fields.name.label')}
						maxLength={CreateTypologySchema.shape.name.maxLength}
						onChange={field.onChange}
						placeholder={t('default:typologies.fields.name.placeholder')}
						readOnly={!capabilities.editEnabled}
						value={field.value ?? ''}
						w="100%"
						withAsterisk={!CreateTypologySchema.shape.name.isOptional()}
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="code"
				render={({ field, fieldState }) => (
					<TextInput
						error={fieldState.error?.message}
						label={t('default:typologies.fields.code.label')}
						maxLength={CreateTypologySchema.shape.code.maxLength}
						onChange={field.onChange}
						placeholder={t('default:typologies.fields.code.placeholder')}
						readOnly={!capabilities.editEnabled}
						value={field.value ?? ''}
						w="100%"
						withAsterisk={!CreateTypologySchema.shape.code.isOptional()}
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
						label={t('default:typologies.fields.agency_ids.label')}
						onChange={field.onChange}
						value={field.value ?? []}
						w="100%"
						withAsterisk={!CreateTypologySchema.shape.agency_ids.isOptional()}
					/>
				)}
			/>
		</Section>
	);
}
