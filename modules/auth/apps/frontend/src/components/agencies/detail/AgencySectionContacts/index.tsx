'use client';

import { useAgencyDetailContext } from '@/components/agencies/detail/AgencyDetail.context';
import { Collapsible, ContextFormController, Grid, Section, TagsInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AgencySectionContacts() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const agencyDetailContext = useAgencyDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.SectionContacts.description')}
			title={t('default:agencies.detail.SectionContacts.title')}
		>
			<Section gap="lg">
				<Grid>
					<ContextFormController
						control={agencyDetailContext.form.instance.control}
						name="contact_emails_pto"
						render={({ field, fieldState }) => (
							<TagsInput
								description={t('default:agencies.detail.SectionContacts.fields.contact_emails_pto.description')}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionContacts.fields.contact_emails_pto.label')}
								onChange={field.onChange}
								readOnly={agencyDetailContext.flags.isReadOnly}
								value={field.value}
							/>
						)}
					/>
					<ContextFormController
						control={agencyDetailContext.form.instance.control}
						name="contact_emails_pta"
						render={({ field, fieldState }) => (
							<TagsInput
								description={t('default:agencies.detail.SectionContacts.fields.contact_emails_pta.description')}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionContacts.fields.contact_emails_pta.label')}
								onChange={field.onChange}
								readOnly={agencyDetailContext.flags.isReadOnly}
								value={field.value}
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
