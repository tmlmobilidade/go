'use client';

import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { CauseIcons, EffectIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { causeSchema, effectSchema } from '@tmlmobilidade/core-types';
import { Combobox, Section, Surface } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

export default function AlertSectionCauseEffect() {
	//
	// A. Setup Variables
	const { data: alertDetailData } = useAlertDetailContext();

	// B. Transform data
	const causeItems = causeSchema.options.map(cause => ({
		icon: CauseIcons[cause],
		label: Translations.CAUSE[cause],
		value: cause,
	}));

	const effectItems = effectSchema.options.map(effect => ({
		icon: EffectIcons[effect],
		label: Translations.EFFECT[effect],
		value: effect,
	}));

	return (
		<Section
			description="A causa é o que aconteceu, o efeito é o que aconteceu como consequência."
			title="Causa e Efeito"
		>
			<Surface
				alignItems="center"
				flexDirection="row"
				gap="md"
				padding="sm"
			>
				<div className={styles.container}>
					<Combobox
						data={causeItems}
						description="O que aconteceu"
						label="Causa"
						{...alertDetailData.form.getInputProps('cause')}
					/>
				</div>
				<div className={styles.container}>
					<Combobox
						data={effectItems}
						description="O que aconteceu como consequência"
						label="Efeito"
						{...alertDetailData.form.getInputProps('effect')}
					/>
				</div>
			</Surface>
		</Section>
	);
}
