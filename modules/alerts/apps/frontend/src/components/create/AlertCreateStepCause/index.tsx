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
	// B. Handle actions

	const handleSelectCause = (value: keyof typeof GtfsCauseExtendedSchema.enum) => {
		alertCreateContext.data.form.setFieldValue('cause', value);
		alertCreateContext.data.multi_step.next();
	};

	//
	// C. Render components

	return (
		<Section padding="lg">
			<Grid columns="abcde" gap="md">
				{Object.values(GtfsCauseExtendedSchema.enum).map(item => (
					<LargeButton
						key={item}
						icon={CauseIcons[item]}
						isActive={alertCreateContext.data.form.getValues().cause === item}
						onClick={() => handleSelectCause(item)}
						title={Translations.CAUSE[item]}
					/>
				))}
			</Grid>
		</Section>
	);
}
