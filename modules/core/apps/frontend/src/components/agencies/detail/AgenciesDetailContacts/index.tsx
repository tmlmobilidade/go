'use client';

import { Collapsible, Grid, Section, StandardFormController, TagsInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAgenciesDetailFormContext } from '../AgenciesDetailForm.context';

/* * */

export function AgenciesDetailContacts() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useAgenciesDetailFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.SectionContacts.description')}
			title={t('default:agencies.detail.SectionContacts.title')}
		>
			<Section gap="lg">
				<Grid>
					<StandardFormController
						control={form.control}
						name="contact_emails_pto"
						render={({ field, fieldState }) => (
							<TagsInput
								description={t('default:agencies.detail.SectionContacts.fields.contact_emails_pto.description')}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionContacts.fields.contact_emails_pto.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="contact_emails_pta"
						render={({ field, fieldState }) => (
							<TagsInput
								description={t('default:agencies.detail.SectionContacts.fields.contact_emails_pta.description')}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionContacts.fields.contact_emails_pta.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);
}
