'use client';

/* * */

import { usePlansDetailContext } from '@/contexts/PlansDetail.context';
import { Collapsible, Section, TextInput } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function PlansDetailSectionPcgiLegacy() {
	//

	//
	// A. Setup variables

	const plansDetailContext = usePlansDetailContext();
	const { t } = useTranslation('plans', { keyPrefix: 'plans.detail.section_pcgi_legacy' });

	//
	// B. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section gap="sm">

				<TextInput
					label={t('operation_plan_id_label')}
					miw="50%"
					placeholder={t('operation_plan_id_placeholder')}
					{...plansDetailContext.data.form.getInputProps('pcgi_legacy.operation_plan_id')}
					readOnly={plansDetailContext.flags.read_only}
				/>

			</Section>
		</Collapsible>
	);

	//
}
