'use client';

import { useAgencyDetailContext } from '@/components/agencies/detail/AgencyDetail.context';
import { AlertCauseValues, AlertEffectValues, AlertReferenceTypeValues } from '@tmlmobilidade/types';
import { Checkbox, Collapsible, ContextFormController, Grid, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AgencySectionAlertsMap() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const agencyDetailContext = useAgencyDetailContext();

	//
	// B. Transform data

	//
	// C. Render components

	return (
		<Collapsible
			description={t('default:agencies.detail.SectionAlertsMap.description')}
			title={t('default:agencies.detail.SectionAlertsMap.title')}
		>
			<Section gap="lg">
				<Grid columns="abcd" gap="lg">
					{AlertCauseValues.map(causeValue => (
						AlertEffectValues.map(effectValue => (
							AlertReferenceTypeValues.map(referenceTypeValue => (
								<ContextFormController
									key={`${causeValue}-${effectValue}-${referenceTypeValue}`}
									control={agencyDetailContext.form.instance.control}
									name={`alerts_map.${causeValue}.${effectValue}.${referenceTypeValue}`}
									render={({ field, fieldState }) => (
										<Checkbox
											checked={field.value}
											error={fieldState.error?.message}
											label={`${causeValue} - ${effectValue} - ${referenceTypeValue}`}
											onChange={field.onChange}
											readOnly={agencyDetailContext.flags.isReadOnly}
										/>
									)}
								/>
							))
						))
					))}
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
