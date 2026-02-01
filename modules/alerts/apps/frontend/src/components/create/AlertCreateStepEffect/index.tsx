/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { EffectIcons } from '@/lib/icons';
import { alertCauseEffectReferenceTypeMap, type AlertEffect } from '@tmlmobilidade/types';
import { Grid, LargeButton, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertCreateStepEffect() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const alertCreateContext = useAlertCreateContext();

	//
	// B. Transform data

	const preparedOptions = Object.keys(alertCauseEffectReferenceTypeMap[alertCreateContext.data.form.getValues().cause])
		.map((item: AlertEffect) => ({ icon: EffectIcons[item], label: t(`shared:alerts.effects.${item}.title`) as string, value: item }))
		.sort((a, b) => a.label.localeCompare(b.label));

	//
	// C. Handle actions

	const handleSelectEffect = (value: AlertEffect) => {
		alertCreateContext.data.form.setFieldValue('effect', value);
		alertCreateContext.data.multi_step.actions.next();
	};

	//
	// D. Render components

	return (
		<Section padding="lg">
			<Grid columns="abcde" gap="md">
				{preparedOptions.map(item => (
					<LargeButton
						key={item.value}
						icon={item.icon}
						isActive={alertCreateContext.data.form.getValues().effect === item.value}
						onClick={() => handleSelectEffect(item.value)}
						orientation="horizontal"
						title={item.label}
					/>
				))}
			</Grid>
		</Section>
	);
}
