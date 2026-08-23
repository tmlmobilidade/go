'use client';

import { Collapsible, Grid, Section, StandardFormController, TagsInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAgenciesDetailFormContext } from '../AgenciesDetailForm.context';

/* * */

export function AgenciesDetailApex() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useAgenciesDetailFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.SectionApex.description')}
			title={t('default:agencies.detail.SectionApex.title')}
		>
			<Section gap="lg">
				<Grid>
					<StandardFormController
						control={form.control}
						name="apex.contact_emails"
						render={({ field, fieldState }) => (
							<TagsInput
								description={t('default:agencies.detail.SectionApex.fields.contact_emails.description')}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionApex.fields.contact_emails.label')}
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
