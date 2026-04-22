/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { alertCauseEffectReferenceTypeMap, type AlertEffect } from '@tmlmobilidade/types';
import { AlertEffectIcons, Grid, LargeButton, Section, useTypicalFormWatch } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertCreateStepEffect() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const alertCreateContext = useAlertCreateContext();

	const watchedFormValues = useTypicalFormWatch(alertCreateContext.data.form, ['cause', 'effect']);

	//
	// B. Transform data

	const preparedOptions = Object.keys(alertCauseEffectReferenceTypeMap[watchedFormValues.cause] ?? {})
		.map((item: AlertEffect) => ({ icon: AlertEffectIcons[item], label: t(`shared:alerts.effects.${item}.title`) as string, value: item }))
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
			<Grid columns="abc" gap="md">
				{preparedOptions.map(item => (
					<LargeButton
						key={item.value}
						icon={item.icon}
						isActive={watchedFormValues.effect === item.value}
						onClick={() => handleSelectEffect(item.value)}
						orientation="horizontal"
						title={item.label}
					/>
				))}
			</Grid>
		</Section>
	);
}
