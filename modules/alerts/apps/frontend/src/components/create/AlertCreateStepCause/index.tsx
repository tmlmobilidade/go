/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { alertCauseEffectReferenceTypeMap } from '@tmlmobilidade/types';
import { AlertCauseIcons, Grid, LargeButton, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertCreateStepCause() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const alertCreateContext = useAlertCreateContext();

	const causeValue = alertCreateContext.form.instance.watch('cause');

	//
	// B. Transform data

	const preparedOptions = (Object.keys(alertCauseEffectReferenceTypeMap) as (keyof typeof alertCauseEffectReferenceTypeMap)[])
		.map(item => ({ icon: AlertCauseIcons[item], label: t(`shared:alerts.causes.${item}.title`) as string, value: item }))
		.sort((a, b) => a.label.localeCompare(b.label));

	//
	// C. Handle actions

	const handleSelectCause = (value: keyof typeof alertCauseEffectReferenceTypeMap) => {
		alertCreateContext.form.instance.setValue('cause', value, { shouldDirty: true });
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
						isActive={causeValue === item.value}
						onClick={() => handleSelectCause(item.value)}
						orientation="horizontal"
						title={item.label}
					/>
				))}
			</Grid>
		</Section>
	);
}
