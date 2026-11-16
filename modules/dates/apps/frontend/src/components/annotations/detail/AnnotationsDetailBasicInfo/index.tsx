'use client';

import { CreateAnnotationSchema } from '@tmlmobilidade/go-types-dates';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ErrorDisplay, MultiSelect, Section, StandardFormController, Textarea, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { AnnotationsCategorySelect } from '../../shared/AnnotationsCategorySelect';
import { AnnotationsImpactInput } from '../../shared/AnnotationsImpactInput';
import { AnnotationsLocationsSelect } from '../../shared/AnnotationsLocationsSelect';
import { AnnotationsSourcesInput } from '../../shared/AnnotationsSourcesInput';
import { useAnnotationsAgenciesData } from '../../shared/use-annotations-agencies-data';
import { useAnnotationsDetailFormContext } from '../AnnotationsDetailForm.context';

/* * */

export function AnnotationsDetailBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useAnnotationsDetailFormContext();
	const { error, isLoading, options } = useAnnotationsAgenciesData({
		permissions: capabilities.editEnabled ? {
			actions: [PermissionCatalog.all.annotations.actions.update],
			scope: PermissionCatalog.all.annotations.scope,
		} : undefined,
	});

	//
	// B. Render components

	return (
		<Section gap="md" padding="none">
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
				name="category"
				render={({ field, fieldState }) => (
					<AnnotationsCategorySelect error={fieldState.error?.message} onChange={field.onChange} readOnly={!capabilities.editEnabled} value={field.value} />
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
				name="impact"
				render={({ field, fieldState }) => (
					<AnnotationsImpactInput error={fieldState.error?.message} onChange={field.onChange} readOnly={!capabilities.editEnabled} value={field.value} />
				)}
			/>
			<StandardFormController
				control={form.control}
				name="sources"
				render={({ field, fieldState }) => (
					<AnnotationsSourcesInput error={fieldState.error?.message} onChange={field.onChange} readOnly={!capabilities.editEnabled} value={field.value} />
				)}
			/>
			<StandardFormController
				control={form.control}
				name="locations"
				render={({ field, fieldState }) => (
					<AnnotationsLocationsSelect error={fieldState.error?.message} onChange={field.onChange} readOnly={!capabilities.editEnabled} value={field.value} />
				)}
			/>
			<StandardFormController
				control={form.control}
				name="agency_ids"
				render={({ field, fieldState }) => (
					<MultiSelect
						data={options}
						description={t('default:annotations.fields.agency_ids.description')}
						disabled={!capabilities.editEnabled || isLoading || !!error}
						error={fieldState.error?.message}
						label={t('default:annotations.fields.agency_ids.label')}
						onChange={field.onChange}
						value={field.value ?? []}
						w="100%"
					/>
				)}
			/>
		</Section>
	);
}
