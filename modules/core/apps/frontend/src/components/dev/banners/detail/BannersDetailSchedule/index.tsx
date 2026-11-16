'use client';

import { Checkbox, Collapsible, DateTimeInput, Section, StandardFormController, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useBannersDetailFormContext } from '../BannersDetailForm.context';

/* * */

export function BannersDetailSchedule() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useBannersDetailFormContext();

	//
	// B. Render components

	return (
		<Collapsible title={t('default:dev.fields.schedule')} defaultOpen>
			<Section gap="md">
				<StandardFormController
					control={form.control}
					name="starts_at"
					render={({ field, fieldState }) => (
						<DateTimeInput
							error={fieldState.error?.message}
							label={t('default:dev.fields.starts_at')}
							onChange={field.onChange}
							readOnly={!capabilities?.editEnabled}
							value={field.value}
							clearable
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="ends_at"
					render={({ field, fieldState }) => (
						<DateTimeInput
							error={fieldState.error?.message}
							label={t('default:dev.fields.ends_at')}
							onChange={field.onChange}
							readOnly={!capabilities?.editEnabled}
							value={field.value}
							clearable
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="dismissible"
					render={({ field }) => (
						<Checkbox
							checked={!!field.value}
							disabled={!capabilities?.editEnabled}
							label={t('default:dev.fields.dismissible')}
							onChange={event => field.onChange(event.currentTarget.checked)}
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="link"
					render={({ field, fieldState }) => (
						<Section gap="sm" padding="none">
							<TextInput
								label={t('default:dev.fields.link_label')}
								readOnly={!capabilities?.editEnabled}
								value={field.value?.label ?? ''}
								w="100%"
								onChange={(event) => {
									const label = event.currentTarget.value;
									field.onChange(!label && !field.value?.url ? null : { label, url: field.value?.url ?? '' });
								}}
							/>
							<TextInput
								error={fieldState.error?.message}
								label={t('default:dev.fields.link_url')}
								readOnly={!capabilities?.editEnabled}
								value={field.value?.url ?? ''}
								w="100%"
								onChange={(event) => {
									const url = event.currentTarget.value;
									field.onChange(!url && !field.value?.label ? null : { label: field.value?.label ?? '', url });
								}}
							/>
						</Section>
					)}
				/>
			</Section>
		</Collapsible>
	);
}
