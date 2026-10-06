'use client';

import { Collapsible, Section, StandardFormController, Switch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useOrganizationsDetailFormContext } from '../OrganizationsDetailForm.context';

/* * */

export function OrganizationsDetailOpenData() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { capabilities, form } = useOrganizationsDetailFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:organizations.detail.SectionOpenData.description')}
			title={t('default:organizations.detail.SectionOpenData.title')}
		>
			<Section>
				<StandardFormController
					control={form.control}
					name="open_data.services.gtfs_enabled"
					render={({ field, fieldState }) => (
						<Switch
							checked={field.value ?? false}
							error={fieldState.error?.message}
							label={t('default:organizations.detail.SectionOpenData.fields.services.gtfs_enabled.label')}
							onChange={field.onChange}
							readOnly={!capabilities.editEnabled}
						/>
					)}
				/>
			</Section>
		</Collapsible>
	);
}
