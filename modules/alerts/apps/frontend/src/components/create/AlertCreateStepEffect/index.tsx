/* * */

import { useAlertCreateContext } from '@/components/create/AlertCreate.context';
import { EffectIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { GtfsEffectSchema } from '@tmlmobilidade/types';
import { Grid, LargeButton, Section } from '@tmlmobilidade/ui';

/* * */

export function AlertCreateStepEffect() {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();

	//
	// B. Handle actions

	const handleSelectEffect = (value: keyof typeof GtfsEffectSchema.enum) => {
		alertCreateContext.data.form.setFieldValue('effect', value);
		alertCreateContext.data.multi_step.next();
	};

	//
	// C. Render components

	return (
		<Section padding="lg">
			<Grid columns="abcde" gap="md">
				{Object.values(GtfsEffectSchema.enum).map(item => (
					<LargeButton
						key={item}
						icon={EffectIcons[item]}
						isActive={alertCreateContext.data.form.getValues().effect === item}
						onClick={() => handleSelectEffect(item)}
						title={Translations.EFFECT[item]}
					/>
				))}
			</Grid>
		</Section>
	);
}
