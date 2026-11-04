'use client';

import { CreateEventSchema } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { ErrorDisplay, MultiSelect, Section, StandardFormController, Textarea, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useEventsAgenciesData } from '../../shared/use-events-agencies-data';
import { useEventsCreateFormContext } from '../EventsCreateForm.context';

/* * */

export function EventCreateBasicInfo() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useEventsCreateFormContext();
	const { error, isLoading, options } = useEventsAgenciesData({
		permissions: {
			actions: [PermissionCatalog.all.events.actions.create],
			scope: PermissionCatalog.all.events.scope,
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
						label={t('default:events.fields.title.label')}
						onChange={field.onChange}
						placeholder={t('default:events.fields.title.placeholder')}
						readOnly={!capabilities.editEnabled}
						value={field.value ?? ''}
						w="100%"
						withAsterisk={!CreateEventSchema.shape.title.isOptional()}
					/>
				)}
			/>
			<StandardFormController
				control={form.control}
				name="code"
				render={({ field, fieldState }) => (
					<TextInput
						description={t('default:events.fields.code.description', { max: CreateEventSchema.shape.code.maxLength })}
						error={fieldState.error?.message}
						label={t('default:events.fields.code.label')}
						maxLength={CreateEventSchema.shape.code.maxLength}
						onChange={event => field.onChange(event.currentTarget.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
						placeholder={t('default:events.fields.code.placeholder')}
						readOnly={!capabilities.editEnabled}
						value={field.value ?? ''}
						w="100%"
						withAsterisk={!CreateEventSchema.shape.code.isOptional()}
					/>
				)}
			/>
			<StandardFormController
				control={form.control}
				name="description"
				render={({ field, fieldState }) => (
					<Textarea
						error={fieldState.error?.message}
						label={t('default:events.fields.description.label')}
						minRows={2}
						onChange={field.onChange}
						placeholder={t('default:events.fields.description.placeholder')}
						readOnly={!capabilities.editEnabled}
						value={field.value ?? ''}
						w="100%"
						withAsterisk={!CreateEventSchema.shape.description.isOptional()}
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
						label={t('default:events.fields.agency_ids.label')}
						onChange={field.onChange}
						value={field.value ?? []}
						w="100%"
						withAsterisk={!CreateEventSchema.shape.agency_ids.isOptional()}
					/>
				)}
			/>
		</Section>
	);

	//
}
