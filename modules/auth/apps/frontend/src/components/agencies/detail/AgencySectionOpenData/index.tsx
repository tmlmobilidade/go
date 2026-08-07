'use client';

import { useAgencyDetailContext } from '@/components/agencies/detail/AgencyDetail.context';
import { Collapsible, ContextFormController, Section, Switch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AgencySectionOpenData() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const agencyDetailContext = useAgencyDetailContext();

	//
	// B. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.SectionOpenData.description')}
			title={t('default:agencies.detail.SectionOpenData.title')}
		>
			<Section gap="lg">
				<ContextFormController
					control={agencyDetailContext.form.instance.control}
					name="open_data.gtfs_enabled"
					render={({ field, fieldState }) => (
						<Switch
							checked={field.value}
							error={fieldState.error?.message}
							label={t('default:agencies.detail.SectionOpenData.fields.gtfs_enabled.label')}
							onChange={field.onChange}
							readOnly={agencyDetailContext.flags.isReadOnly}
						/>
					)}
				/>
				<ContextFormController
					control={agencyDetailContext.form.instance.control}
					name="open_data.positions_enabled"
					render={({ field, fieldState }) => (
						<Switch
							checked={field.value}
							error={fieldState.error?.message}
							label={t('default:agencies.detail.SectionOpenData.fields.positions_enabled.label')}
							onChange={field.onChange}
							readOnly={agencyDetailContext.flags.isReadOnly}
						/>
					)}
				/>
				<ContextFormController
					control={agencyDetailContext.form.instance.control}
					name="open_data.eta_enabled"
					render={({ field, fieldState }) => (
						<Switch
							checked={field.value}
							error={fieldState.error?.message}
							label={t('default:agencies.detail.SectionOpenData.fields.eta_enabled.label')}
							onChange={field.onChange}
							readOnly={agencyDetailContext.flags.isReadOnly}
						/>
					)}
				/>
				<ContextFormController
					control={agencyDetailContext.form.instance.control}
					name="open_data.service_alerts_enabled"
					render={({ field, fieldState }) => (
						<Switch
							checked={field.value}
							error={fieldState.error?.message}
							label={t('default:agencies.detail.SectionOpenData.fields.service_alerts_enabled.label')}
							onChange={field.onChange}
							readOnly={agencyDetailContext.flags.isReadOnly}
						/>
					)}
				/>
			</Section>
		</Collapsible>
	);
}
