'use client';

/* * */

import { useScheduledAlertCreateContext } from '@/components/scheduled/create/ScheduledAlertCreate.context';
import { CauseIcons, EffectIcons } from '@/lib/icons';
import { gtfsCauseSchema, gtfsEffectSchema } from '@tmlmobilidade/types';
import { Combobox, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function ScheduledAlertCreateSectionCauseEffect() {
	//

	//
	// A. Setup variables

	const scheduledAlertCreateContext = useScheduledAlertCreateContext();
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
		<Section flexDirection="row" gap="md">
			<div className={styles.container}>
				<Combobox
					key={scheduledAlertCreateContext.data.form.key('cause')}
					data={causeItems}
					description="O que aconteceu"
					label="Causa"
					{...scheduledAlertCreateContext.data.form.getInputProps('cause')}
				/>
			</div>
			<div className={styles.container}>
				<Combobox
					key={scheduledAlertCreateContext.data.form.key('effect')}
					data={effectItems}
					description="O que aconteceu como consequência"
					label="Efeito"
					{...scheduledAlertCreateContext.data.form.getInputProps('effect')}
				/>
			</div>
		</Section>
	);

	//
}
