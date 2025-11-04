'use client';

/* * */

import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { CauseIcons, EffectIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { gtfsCauseSchema, gtfsEffectSchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function RealtimeDetailSectionCauseEffect() {
	//

	//
	// A. Setup variables

	const realtimeDetailContext = useRealtimeDetailContext();

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
			<Section flexDirection="row" gap="md">
				<div className={styles.container}>
					<Combobox
						data={causeItems}
						description="O que aconteceu"
						label="Causa"
						{...realtimeDetailContext.data.form.getInputProps('cause')}
					/>
				</div>
				<div className={styles.container}>
					<Combobox
						data={effectItems}
						description="O que aconteceu como consequência"
						label="Efeito"
						{...realtimeDetailContext.data.form.getInputProps('effect')}
					/>
				</div>
			</Section>
		</Collapsible>
	);

	//
}
