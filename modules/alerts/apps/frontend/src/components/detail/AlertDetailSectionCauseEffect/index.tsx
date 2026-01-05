'use client';

/* * */

import { useAlertDetailContext } from '@/components/detail/AlertDetail.context';
import { CauseIcons, EffectIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { GtfsCauseExtendedSchema, GtfsEffectSchema } from '@tmlmobilidade/types';
import { Collapsible, Grid, Section, Select } from '@tmlmobilidade/ui';

/* * */

export function AlertDetailSectionCauseEffect() {
	//

	//
	// A. Setup variables

	const alertDetailContext = useAlertDetailContext();

	//
	// B. Transform data

	const causeItems = GtfsCauseExtendedSchema.options.map(cause => ({
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
		<Collapsible
			description="A causa é o que aconteceu, o efeito é o que aconteceu como consequência."
			title="Causa e Efeito"
		>
			<Section>
				<Grid columns="ab" gap="md">
					<Select
						key={alertDetailContext.data.form.key('cause')}
						data={causeItems}
						description="O que aconteceu"
						label="Causa"
						{...alertDetailContext.data.form.getInputProps('cause')}
					/>
					<Select
						key={alertDetailContext.data.form.key('effect')}
						data={effectItems}
						description="O que aconteceu como consequência"
						label="Efeito"
						{...alertDetailContext.data.form.getInputProps('effect')}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
