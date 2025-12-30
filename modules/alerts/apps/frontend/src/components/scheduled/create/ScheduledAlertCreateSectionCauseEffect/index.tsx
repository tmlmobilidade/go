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
	const { t: tAlerts } = useTranslation('alerts', { keyPrefix: 'scheduled.create.sectionCauseEffect' });

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
					description={tAlerts('fields.causeDescription')}
					label={tAlerts('fields.causeLabel')}
					{...scheduledAlertCreateContext.data.form.getInputProps('cause')}
				/>
			</div>
			<div className={styles.container}>
				<Combobox
					key={scheduledAlertCreateContext.data.form.key('effect')}
					data={effectItems}
					description={tAlerts('fields.effectDescription')}
					label={tAlerts('fields.effectLabel')}
					{...scheduledAlertCreateContext.data.form.getInputProps('effect')}
				/>
			</div>
		</Section>
	);

	//
}
