'use client';

import { Collapsible, Section, StandardFormController, Textarea, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { ContentScope } from '../../../shared/ContentScope';
import { useChangelogDetailFormContext } from '../ChangelogDetailForm.context';

/* * */

export function ChangelogDetailContent() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useChangelogDetailFormContext();

	//
	// B. Render components

	return (
		<Collapsible title={t('default:dev.sections.content')} defaultOpen>
			<Section gap="md">
				<StandardFormController
					control={form.control}
					name="title"
					render={({ field, fieldState }) => (
						<TextInput
							error={fieldState.error?.message}
							label={t('default:dev.fields.title')}
							onChange={field.onChange}
							readOnly={!capabilities?.editEnabled}
							value={field.value ?? ''}
							w="100%"
							withAsterisk
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="summary"
					render={({ field, fieldState }) => (
						<Textarea
							error={fieldState.error?.message}
							label={t('default:dev.fields.summary')}
							minRows={3}
							onChange={field.onChange}
							readOnly={!capabilities?.editEnabled}
							value={field.value ?? ''}
							w="100%"
							autosize
							withAsterisk
						/>
					)}
				/>

				<StandardFormController
					control={form.control}
					name="scope"
					render={({ field, fieldState }) => (
						<ContentScope disabled={!capabilities?.editEnabled} error={fieldState.error?.message} onChange={field.onChange} value={field.value} />
					)}
				/>
			</Section>
		</Collapsible>
	);
}
