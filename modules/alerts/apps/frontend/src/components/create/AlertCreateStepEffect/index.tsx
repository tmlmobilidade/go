/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { alertCauseEffectReferenceTypeMap, type AlertEffect } from '@tmlmobilidade/types';
import { AlertEffectIcons, Grid, LargeButton, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertCreateStepEffect() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const alertCreateContext = useAlertCreateContext();

	const causeValue = alertCreateContext.form.instance.watch('cause');
	const effectValue = alertCreateContext.form.instance.watch('effect');

	//
	// B. Transform data

	const preparedOptions = Object.keys(alertCauseEffectReferenceTypeMap[causeValue] ?? {})
		.map((item: AlertEffect) => ({ icon: AlertEffectIcons[item], label: t(`shared:alerts.effects.${item}.title`) as string, value: item }))
		.sort((a, b) => a.label.localeCompare(b.label));

	//
	// C. Handle actions

	const handleSelectEffect = (value: AlertEffect) => {
		alertCreateContext.form.instance.setValue('effect', value, { shouldDirty: true });
		alertCreateContext.form.multi_step.actions.next();
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
						isActive={effectValue === item.value}
						onClick={() => handleSelectEffect(item.value)}
						orientation="horizontal"
						title={item.label}
					/>
				))}
			</Grid>
		</Section>
	);
}
