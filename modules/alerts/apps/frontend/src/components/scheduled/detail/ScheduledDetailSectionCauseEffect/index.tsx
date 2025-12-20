'use client';

/* * */

import { useScheduledDetailContext } from '@/components/scheduled/detail/ScheduledDetail.context';
import { CauseIcons, EffectIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { gtfsCauseSchema, gtfsEffectSchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, Select } from '@tmlmobilidade/ui';

/* * */

export function ScheduledDetailSectionCauseEffect() {
	//

	//
	// A. Setup variables

	const scheduledDetailContext = useScheduledDetailContext();

	//
	// B. Transform data

	const causeItems = gtfsCauseSchema.options.map(cause => ({
		icon: CauseIcons[cause],
		label: Translations.CAUSE[cause],
		value: cause,
	}));

	const effectItems = gtfsEffectSchema.options.map(effect => ({
		icon: EffectIcons[effect],
		label: Translations.EFFECT[effect],
		value: effect,
	}));

	//
	// C. Render components

	return (
		<Collapsible
			description="A causa é o que aconteceu, o efeito é o que aconteceu como consequência."
			title="Causa e Efeito"
		>
			<Section>
				<Grid columns="ab" gap="md">
					<Select
						key={scheduledDetailContext.data.form.key('cause')}
						data={causeItems}
						description="O que aconteceu"
						label="Causa"
						{...scheduledDetailContext.data.form.getInputProps('cause')}
					/>
					<Select
						key={scheduledDetailContext.data.form.key('effect')}
						data={effectItems}
						description="O que aconteceu como consequência"
						label="Efeito"
						{...scheduledDetailContext.data.form.getInputProps('effect')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
