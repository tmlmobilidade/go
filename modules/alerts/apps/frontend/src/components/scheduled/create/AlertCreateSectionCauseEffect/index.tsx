'use client';

/* * */

import { useAlertCreateContext } from '@/contexts/AlertCreate.context';
import { CauseIcons, EffectIcons } from '@/lib/icons';
import { gtfsCauseSchema, gtfsEffectSchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function AlertCreateSectionCauseEffect() {
	//

	//
	// A. Setup variables

	const alertCreateContext = useAlertCreateContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'scheduled.create.sectionCauseEffect' });
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
						key={alertCreateContext.data.form.key('cause')}
						data={causeItems}
						description={t('fields.cause_description')}
						label={t('fields.cause_label')}
						{...alertCreateContext.data.form.getInputProps('cause')}
					/>
				</div>
				<div className={styles.container}>
					<Combobox
						key={alertCreateContext.data.form.key('effect')}
						data={effectItems}
						description={t('fields.effect_description')}
						label={t('fields.effect_label')}
						{...alertCreateContext.data.form.getInputProps('effect')}
					/>
				</div>
			</Section>
		</Collapsible>
	);

	//
}
