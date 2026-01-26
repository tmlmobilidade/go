/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { CauseIcons } from '@/lib/icons';
import { alertCauseEffectReferenceTypeMap } from '@tmlmobilidade/types';
import { Grid, LargeButton, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertCreateStepCause() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const alertCreateContext = useAlertCreateContext();

	//
	// B. Transform data

	const preparedOptions = (Object.keys(alertCauseEffectReferenceTypeMap) as (keyof typeof alertCauseEffectReferenceTypeMap)[])
		.map(item => ({ icon: CauseIcons[item], label: t(`alert-causes:${item}.title`) as string, value: item }))
		.sort((a, b) => a.label.localeCompare(b.label));

	//
	// C. Handle actions

	const handleSelectCause = (value: keyof typeof alertCauseEffectReferenceTypeMap) => {
		alertCreateContext.data.form.setFieldValue('cause', value);
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
						isActive={alertCreateContext.data.form.getValues().cause === item.value}
						onClick={() => handleSelectCause(item.value)}
						orientation="horizontal"
						title={item.label}
					/>
				))}
			</Grid>
		</Section>
	);
}
