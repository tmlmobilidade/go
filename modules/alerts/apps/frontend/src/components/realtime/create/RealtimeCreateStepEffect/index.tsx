/* * */

import { useRealtimeCreateContext } from '@/components/realtime/create/RealtimeCreate.context';
import { EffectIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { gtfsEffectSchema } from '@tmlmobilidade/types';
import { Grid, LargeButton, Section } from '@tmlmobilidade/ui';

/* * */

export function RealtimeCreateStepEffect() {
	//

	//
	// A. Setup variables

	const realtimeCreateContext = useRealtimeCreateContext();

	//
	// B. Handle actions

	const handleSelectEffect = (value: keyof typeof gtfsEffectSchema.enum) => {
		realtimeCreateContext.data.form.setFieldValue('effect', value);
		realtimeCreateContext.actions.nextStep();
	};

	//
	// C. Render components

	return (
		<Section padding="lg">
			<Grid columns="abcde" gap="md">
				{Object.values(gtfsEffectSchema.enum).map(item => (
					<LargeButton
						key={item}
						icon={EffectIcons[item]}
						isActive={realtimeCreateContext.data.form.getValues().effect === item}
						onClick={() => handleSelectEffect(item)}
						title={Translations.EFFECT[item]}
					/>
				))}
			</Grid>
		</Section>
	);
}
