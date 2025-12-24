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

	//
	// B. Handle actions

	const handleSelectCause = (value: keyof typeof gtfsCauseSchema.enum) => {
		realtimeCreateContext.data.form.setFieldValue('cause', value);
		realtimeCreateContext.data.multi_step.next();
	};

	//
	// C. Render components

	return (
		<Section padding="lg">
			<Grid columns="abcde" gap="md">
				{Object.values(gtfsCauseSchema.enum).map(item => (
					<LargeButton
						key={item}
						icon={CauseIcons[item]}
						isActive={realtimeCreateContext.data.form.getValues().cause === item}
						onClick={() => handleSelectCause(item)}
						title={Translations.CAUSE[item]}
					/>
				))}
			</Grid>
		</Section>
	);
}
