'use client';

import { CreateAnnotationSchema } from '@tmlmobilidade/go-types-dates';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ErrorDisplay, MultiSelect, Section, StandardFormController, Textarea, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAnnotationsAgenciesData } from '../../shared/use-annotations-agencies-data';
import { useAnnotationsCreateFormContext } from '../AnnotationsCreateForm.context';

/* * */

export function AnnotationCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useAnnotationsCreateFormContext();
	const { error, isLoading, options } = useAnnotationsAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.annotations.actions.create],
			scope: PermissionCatalog.all.annotations.scope,
		},
	});

	//
	// B. Render components

	return (
		<Section gap="md">
			{error && <ErrorDisplay message={error} />}
			<StandardFormController
				control={form.control}
				name="title"
				render={({ field, fieldState }) => (
					<TextInput
						error={fieldState.error?.message}
						label={t('default:annotations.fields.title.label')}
						onChange={field.onChange}
						placeholder={t('default:annotations.fields.title.placeholder')}
						readOnly={!capabilities.editEnabled}
						value={field.value ?? ''}
						w="100%"
						withAsterisk={!CreateAnnotationSchema.shape.title.isOptional()}
					/>
				)}
			/>
			<StandardFormController
				control={form.control}
				name="description"
				render={({ field, fieldState }) => (
					<Textarea
						error={fieldState.error?.message}
						label={t('default:annotations.fields.description.label')}
						onChange={field.onChange}
						placeholder={t('default:annotations.fields.description.placeholder')}
						readOnly={!capabilities.editEnabled}
						value={field.value ?? ''}
						w="100%"
						withAsterisk={!CreateAnnotationSchema.shape.description.isOptional()}
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
						label={t('default:annotations.fields.agency_ids.label')}
						onChange={field.onChange}
						value={field.value ?? []}
						w="100%"
						withAsterisk={!CreateAnnotationSchema.shape.agency_ids.isOptional()}
					/>
				)}
			/>
		</Section>
	);

	//
}
