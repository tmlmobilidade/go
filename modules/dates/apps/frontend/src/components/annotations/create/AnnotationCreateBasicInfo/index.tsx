'use client';

import { CreateAnnotationSchema } from '@tmlmobilidade/go-types-dates';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ErrorDisplay, MultiSelect, Section, StandardFormController, Textarea, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { AnnotationsCategorySelect } from '../../shared/AnnotationsCategorySelect';
import { AnnotationsDatesSelect } from '../../shared/AnnotationsDatesSelect';
import { AnnotationsImpactInput } from '../../shared/AnnotationsImpactInput';
import { AnnotationsLocationsSelect } from '../../shared/AnnotationsLocationsSelect';
import { AnnotationsSourceInput } from '../../shared/AnnotationsSourceInput';
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
				name="source"
				render={({ field, fieldState }) => (
					<AnnotationsSourceInput error={fieldState.error?.message} onChange={field.onChange} readOnly={!capabilities.editEnabled} value={field.value} />
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
			<StandardFormController
				control={form.control}
				name="dates"
				render={({ field, fieldState }) => (
					<AnnotationsDatesSelect error={fieldState.error?.message} onChange={field.onChange} readOnly={!capabilities.editEnabled} value={field.value} />
				)}
			/>

		</Section>
	);

	//
}
