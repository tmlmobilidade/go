'use client';

import { Collapsible, Section, StandardFormController, Switch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { useAgenciesDetailFormContext } from '../AgenciesDetailForm.context';

/* * */

export function AgenciesDetailOpenData() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { capabilities, form } = useAgenciesDetailFormContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.SectionOpenData.description')}
			title={t('default:agencies.detail.SectionOpenData.title')}
		>
			<Section gap="lg">
				<StandardFormController
					control={form.control}
					name="open_data.gtfs_enabled"
					render={({ field, fieldState }) => (
						<Switch
							checked={field.value}
							error={fieldState.error?.message}
							label={t('default:agencies.detail.SectionOpenData.fields.gtfs_enabled.label')}
							onChange={field.onChange}
							readOnly={!capabilities.editEnabled}
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="open_data.positions_enabled"
					render={({ field, fieldState }) => (
						<Switch
							checked={field.value}
							error={fieldState.error?.message}
							label={t('default:agencies.detail.SectionOpenData.fields.positions_enabled.label')}
							onChange={field.onChange}
							readOnly={!capabilities.editEnabled}
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="open_data.eta_enabled"
					render={({ field, fieldState }) => (
						<Switch
							checked={field.value}
							error={fieldState.error?.message}
							label={t('default:agencies.detail.SectionOpenData.fields.eta_enabled.label')}
							onChange={field.onChange}
							readOnly={!capabilities.editEnabled}
						/>
					)}
				/>
				<StandardFormController
					control={form.control}
					name="open_data.service_alerts_enabled"
					render={({ field, fieldState }) => (
						<Switch
							checked={field.value}
							error={fieldState.error?.message}
							label={t('default:agencies.detail.SectionOpenData.fields.service_alerts_enabled.label')}
							onChange={field.onChange}
							readOnly={!capabilities.editEnabled}
						/>
					)}
				/>
			</Section>
		</Collapsible>
	);
}
