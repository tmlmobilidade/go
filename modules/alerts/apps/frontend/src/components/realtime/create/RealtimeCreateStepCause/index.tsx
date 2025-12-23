/* * */

import { useRealtimeCreateContext } from '@/components/realtime/create/RealtimeCreate.context';
import { CauseIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { GtfsCause, gtfsCauseSchema } from '@tmlmobilidade/types';
import { Grid, LargeButton, Section } from '@tmlmobilidade/ui';

/* * */

interface CauseItem {
	icon: React.ReactNode
	label: string
	value: GtfsCause
}

export function RealtimeCreateStepCause() {
	//

	//
	// A. Setup variables

	const realtimeCreateContext = useRealtimeCreateContext();

	const causeItems: CauseItem[] = Object.values(gtfsCauseSchema.enum).map(cause => ({
		icon: CauseIcons[cause],
		label: Translations.CAUSE[cause],
		value: cause,
	}));

	//
	// B. Handle actions

	const handleClick = (cause: CauseItem) => {
		realtimeCreateContext.data.form.setFieldValue('cause', cause.value);
		realtimeCreateContext.actions.nextStep();
	};

	//
	// B. Render components

	return (
		<Section padding="lg">
			<Grid columns="abcde" gap="md">
				{causeItems.map(cause => (
					<LargeButton
						key={cause.value}
						icon={cause.icon}
						onClick={() => handleClick(cause)}
						title={cause.label}
					/>
				))}
			</Grid>
		</Section>
	);
}
