'use client';

/* * */

import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { CauseIcons, EffectIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { gtfsCauseSchema, gtfsEffectSchema } from '@tmlmobilidade/types';
import { Collapsible, Combobox, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function AlertDetailSectionCauseEffect() {
	//

	//
	// A. Setup variables

	const alertDetailContext = useAlertDetailContext();
	const { t } = useTranslation('alerts', { keyPrefix: 'scheduled.detail.sectionCauseEffect' });

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
	console.log('data', alertDetailContext.data.form.values);

	return (
		<Collapsible
			description={t('description')}
			title={t('title')}
		>
			<Section flexDirection="row" gap="md">
				<div className={styles.container}>
					<Combobox
						data={causeItems}
						description={t('cause_description')}
						label={t('cause_label')}
						value={alertDetailContext.data.form.values.cause}
						{...alertDetailContext.data.form.getInputProps('cause')}
					/>
				</div>
				<div className={styles.container}>
					<Combobox
						data={effectItems}
						description={t('effect_description')}
						label={t('effect_label')}
						value={alertDetailContext.data.form.values.effect}
						{...alertDetailContext.data.form.getInputProps('effect')}
					/>
				</div>
			</Section>
		</Collapsible>
	);

	//
}
