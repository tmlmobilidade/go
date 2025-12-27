'use client';

/* * */

import { useScheduledAlertCreateContext } from '@/components/scheduled/create/ScheduledAlertCreate.context';
import { CauseIcons, EffectIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { GtfsCauseSchema, GtfsEffectSchema } from '@tmlmobilidade/types';
import { Grid, Section, Select } from '@tmlmobilidade/ui';

/* * */

export function ScheduledAlertCreateSectionCauseEffect() {
	//

	//
	// A. Setup variables

	const scheduledAlertCreateContext = useScheduledAlertCreateContext();

	//
	// B. Transform data

	const causeItems = GtfsCauseSchema.options.map(cause => ({
		icon: CauseIcons[cause],
		label: Translations.CAUSE[cause],
		value: cause,
	}));

	const effectItems = GtfsEffectSchema.options.map(effect => ({
		icon: EffectIcons[effect],
		label: Translations.EFFECT[effect],
		value: effect,
	}));

	//
	// C. Render components

	return (
		<Section>
			<Grid columns="ab" gap="md">
				<Select
					key={scheduledAlertCreateContext.data.form.key('cause')}
					data={causeItems}
					description="O que aconteceu"
					label="Causa"
					{...scheduledAlertCreateContext.data.form.getInputProps('cause')}
				/>
				<Select
					key={scheduledAlertCreateContext.data.form.key('effect')}
					data={effectItems}
					description="O que aconteceu como consequência"
					label="Efeito"
					{...scheduledAlertCreateContext.data.form.getInputProps('effect')}
				/>
			</Grid>
		</Section>
	);

	//
}
