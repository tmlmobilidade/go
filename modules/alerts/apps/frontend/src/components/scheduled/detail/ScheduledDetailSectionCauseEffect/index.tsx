'use client';

/* * */

import { useScheduledDetailContext } from '@/components/scheduled/detail/ScheduledDetail.context';
import { CauseIcons, EffectIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { gtfsCauseSchema, gtfsEffectSchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function ScheduledDetailSectionCauseEffect() {
	//

	//
	// A. Setup variables

	const alertDetailContext = useScheduledDetailContext();

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
						key={alertDetailContext.data.form.key('cause')}
						data={causeItems}
						description="O que aconteceu"
						label="Causa"
						value={alertDetailContext.data.form.values.cause}
						{...alertDetailContext.data.form.getInputProps('cause')}
					/>
				</div>
				<div className={styles.container}>
					<Combobox
						key={alertDetailContext.data.form.key('effect')}
						data={effectItems}
						description="O que aconteceu como consequência"
						label="Efeito"
						value={alertDetailContext.data.form.values.effect}
						{...alertDetailContext.data.form.getInputProps('effect')}
					/>
				</div>
			</Section>
		</Collapsible>
	);

	//
}
