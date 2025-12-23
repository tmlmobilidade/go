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

	const effectItems = Object
		.values(gtfsEffectSchema.enum)
		.map(effect => ({
			icon: EffectIcons[effect],
			label: Translations.EFFECT[effect],
			value: effect,
		}));

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
				{effectItems.map(effect => (
					<LargeButton
						key={effect.value}
						icon={effect.icon}
						onClick={() => handleSelectEffect(effect.value)}
						title={effect.label}
					/>
				))}
			</Grid>
		</Section>
	);
}
