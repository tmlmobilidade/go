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
	// B. Transform data

	const preparedOptions = Object.values(GtfsEffectSchema.enum)
		.map(item => ({ icon: EffectIcons[item], label: Translations.EFFECT[item], value: item }))
		.sort((a, b) => a.label.localeCompare(b.label));

	//
	// C. Handle actions

	const handleSelectEffect = (value: keyof typeof GtfsEffectSchema.enum) => {
		alertCreateContext.data.form.setFieldValue('effect', value);
		alertCreateContext.data.multi_step.next();
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
