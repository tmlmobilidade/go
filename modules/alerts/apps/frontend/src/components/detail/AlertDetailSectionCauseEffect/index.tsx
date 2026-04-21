'use client';

/* * */

import { useAlertDetailContext } from '@/contexts/AlertDetail.context';
import { AlertCauseSchema, AlertEffectSchema } from '@tmlmobilidade/types';
import { AlertCauseIcons, AlertEffectIcons, Collapsible, Grid, Section, Select } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

export function AlertDetailSectionCauseEffect() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const alertDetailContext = useAlertDetailContext();

	//
	// B. Transform data

	const causeItems = AlertCauseSchema.options.map(cause => ({
		icon: AlertCauseIcons[cause],
		label: t(`shared:alerts.causes.${cause}.title`),
		value: cause,
	}));

	const effectItems = AlertEffectSchema.options.map(effect => ({
		icon: AlertEffectIcons[effect],
		label: t(`shared:alerts.effects.${effect}.title`),
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
