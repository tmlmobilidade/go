'use client';

import { Collapsible, Grid, Section, StandardFormController, TagsInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAgenciesDetailFormContext } from '../AgenciesDetailForm.context';

/* * */

export function AgenciesDetailPlans() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useAgenciesDetailFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.SectionPlans.description')}
			title={t('default:agencies.detail.SectionPlans.title')}
		>
			<Section gap="lg">
				<Grid>
					<StandardFormController
						control={form.control}
						name="plans.approval_request_emails"
						render={({ field, fieldState }) => (
							<TagsInput
								description={t('default:agencies.detail.SectionPlans.fields.approval_request_emails.description')}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionPlans.fields.approval_request_emails.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="plans.approval_notification_emails"
						render={({ field, fieldState }) => (
							<TagsInput
								description={t('default:agencies.detail.SectionPlans.fields.approval_notification_emails.description')}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionPlans.fields.approval_notification_emails.label')}
								onChange={field.onChange}
								readOnly={!capabilities.editEnabled}
								value={field.value}
							/>
						)}
					/>
					<StandardFormController
						control={form.control}
						name="plans.apex_notification_emails"
						render={({ field, fieldState }) => (
							<TagsInput
								description={t('default:agencies.detail.SectionPlans.fields.apex_notification_emails.description')}
								error={fieldState.error?.message}
								label={t('default:agencies.detail.SectionPlans.fields.apex_notification_emails.label')}
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
