'use client';

import { useAgencyDetailContext } from '@/components/agencies/detail/AgencyDetail.context';
import { Collapsible, ContextFormController, Grid, Section, TagsInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AgencySectionApex() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const agencyDetailContext = useAgencyDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.SectionApex.description')}
			title={t('default:agencies.detail.SectionApex.title')}
		>
			<Section gap="lg">
				<Grid>
					<ContextFormController
						control={agencyDetailContext.form.instance.control}
						name="apex.contact_emails"
						render={({ field, fieldState }) => (
							<TagsInput
								description={t('default:agencies.detail.SectionApex.fields.contact_emails.description')}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionApex.fields.contact_emails.label')}
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
}
