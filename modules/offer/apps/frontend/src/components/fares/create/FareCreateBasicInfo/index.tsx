'use client';

import { CreateFareSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ErrorDisplay, MultiSelect, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useFaresAgenciesData } from '../../shared/use-fares-agencies-data';
import { useFaresCreateFormContext } from '../FaresCreateForm.context';

/* * */

export function FareCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useFaresCreateFormContext();
	const { error, isLoading, options } = useFaresAgenciesData({ permissions: { actions: [PermissionCatalog.all.fares.actions.create], scope: PermissionCatalog.all.fares.scope } });

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
						label={t('default:fares.fields.name.label')}
						maxLength={CreateFareSchema.shape.name.maxLength}
						onChange={field.onChange}
						placeholder={t('default:fares.fields.name.placeholder')}
						readOnly={!capabilities.editEnabled}
						value={field.value ?? ''}
						w="100%"
						withAsterisk={!CreateFareSchema.shape.name.isOptional()}
					/>
				)}
			/>

			<StandardFormController
				control={form.control}
				name="code"
				render={({ field, fieldState }) => (
					<TextInput
						error={fieldState.error?.message}
						label={t('default:fares.fields.code.label')}
						maxLength={CreateFareSchema.shape.code.maxLength}
						onChange={field.onChange}
						placeholder={t('default:fares.fields.code.placeholder')}
						readOnly={!capabilities.editEnabled}
						value={field.value ?? ''}
						w="100%"
						withAsterisk={!CreateFareSchema.shape.code.isOptional()}
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
						label={t('default:fares.fields.agency_ids.label')}
						onChange={field.onChange}
						value={field.value ?? []}
						w="100%"
						withAsterisk={!CreateFareSchema.shape.agency_ids.isOptional()}
					/>
				)}
			/>
		</Section>
	);
}
