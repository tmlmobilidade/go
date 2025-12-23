/* * */

import { useRealtimeCreateContext } from '@/components/realtime/create/RealtimeCreate.context';
import { CauseIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { gtfsCauseSchema } from '@tmlmobilidade/types';
import { Grid, LargeButton, Section } from '@tmlmobilidade/ui';

/* * */

export function RealtimeCreateStepCause() {
	//

	//
	// A. Setup variables

	const realtimeCreateContext = useRealtimeCreateContext();

	const causeItems = Object
		.values(gtfsCauseSchema.enum)
		.map(cause => ({
			icon: CauseIcons[cause],
			label: Translations.CAUSE[cause],
			value: cause,
		}));

	//
	// B. Handle actions

	const handleSelectCause = (value: keyof typeof gtfsCauseSchema.enum) => {
		realtimeCreateContext.data.form.setFieldValue('cause', value);
		realtimeCreateContext.actions.nextStep();
	};

	//
	// C. Render components

	return (
		<Section padding="lg">
			<Grid columns="abcde" gap="md">
				{causeItems.map(cause => (
					<LargeButton
						key={cause.value}
						icon={cause.icon}
						onClick={() => handleSelectCause(cause.value)}
						title={cause.label}
					/>
				))}
			</Grid>
		</Section>
	);
}
