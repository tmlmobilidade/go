/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { CauseIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { GtfsCauseExtendedSchema } from '@tmlmobilidade/types';
import { Grid, LargeButton, Section } from '@tmlmobilidade/ui';

/* * */

export function AlertCreateStepCause() {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();

	//
	// B. Transform data

	const preparedOptions = Object.values(GtfsCauseExtendedSchema.enum)
		.map(item => ({ icon: CauseIcons[item], label: Translations.CAUSE[item], value: item }))
		.sort((a, b) => a.label.localeCompare(b.label));

	//
	// C. Handle actions

	const handleSelectCause = (value: keyof typeof GtfsCauseExtendedSchema.enum) => {
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
