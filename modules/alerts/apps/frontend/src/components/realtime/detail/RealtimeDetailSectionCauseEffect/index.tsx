'use client';

/* * */

import { useRealtimeDetailContext } from '@/contexts/RealtimeDetail.context';
import { CauseIcons, EffectIcons } from '@/lib/icons';
import { gtfsCauseSchema, gtfsEffectSchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function RealtimeDetailSectionCauseEffect() {
	//

	//
	// A. Setup variables

	const realtimeDetailContext = useRealtimeDetailContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'realtime.detail.sectionCauseEffect' });
	const { t: tGlobal } = useTranslation('global', { keyPrefix: 'causesAndEffects' });

	//
	// B. Transform data

	const causeItems = gtfsCauseSchema.options.map(cause => ({
		icon: CauseIcons[cause],
		label: tGlobal(`cause.${cause}`),
		value: cause,
	}));

	const effectItems = gtfsEffectSchema.options.map(effect => ({
		icon: EffectIcons[effect],
		label: tGlobal(`effect.${effect}`),
		value: effect,
	}));

	//
	// C. Render components

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section flexDirection="row" gap="md">
				<div className={styles.container}>
					<Combobox
						data={causeItems}
						description={t('fields.causeDescription')}
						label={t('fields.causeLabel')}
						{...realtimeDetailContext.data.form.getInputProps('cause')}
					/>
				</div>
				<div className={styles.container}>
					<Combobox
						data={effectItems}
						description={t('fields.effectDescription')}
						label={t('fields.effectLabel')}
						{...realtimeDetailContext.data.form.getInputProps('effect')}
					/>
				</div>
			</Section>
		</Collapsible>
	);

	//
}
