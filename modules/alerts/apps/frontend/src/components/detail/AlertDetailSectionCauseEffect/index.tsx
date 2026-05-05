'use client';

/* * */

import { useAlertDetailContext } from '@/components/detail/AlertDetail.context';
import { AlertCauseSchema, AlertEffectSchema } from '@tmlmobilidade/types';
import { AlertCauseIcons, AlertEffectIcons, Collapsible, ContextFormController, Grid, Section, Select } from '@tmlmobilidade/ui';
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
					<ContextFormController
						control={alertDetailContext.form.instance.control}
						name="cause"
						render={({ field, fieldState }) => (
							<Select
								data={causeItems}
								description="O que aconteceu"
								error={fieldState.error?.message}
								label="Causa"
								onChange={field.onChange}
								value={field.value}
							/>
						)}
					/>
					<ContextFormController
						control={alertDetailContext.form.instance.control}
						name="effect"
						render={({ field, fieldState }) => (
							<Select
								data={effectItems}
								description="O que aconteceu como consequência"
								error={fieldState.error?.message}
								label="Efeito"
								onChange={field.onChange}
								value={field.value}
							/>
						)}
					/>
				</Grid>
			</Section>
		</Collapsible>
	);

	//
}
