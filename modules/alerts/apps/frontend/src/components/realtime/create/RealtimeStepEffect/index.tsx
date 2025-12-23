/* * */

import { useRealtimeCreateContext } from '@/contexts/RealtimeCreate.context';
import { EffectIcons } from '@/lib/icons';
import { GtfsEffect, gtfsEffectSchema } from '@tmlmobilidade/types';
import { Grid, Section } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

interface EffectItem {
	icon: React.ReactNode
	label: string
	value: GtfsEffect
}

export function RealtimeStepEffect() {
	//
	// A. Setup variables

	const { t } = useTranslation('global', { keyPrefix: 'causesAndEffects' });
	const EffectItems: EffectItem[] = Object.values(gtfsEffectSchema.enum).map(Effect => ({
		icon: EffectIcons[Effect],
		label: t(`effect.${Effect}`),
		value: Effect,
	}));

	//
	// B. Render components

	return (
		<Section>
			<Grid columns="abcd" gap="xl" hAlign="center" vAlign="center">
				{EffectItems.map(Effect => (
					<EffectItem key={Effect.value} Effect={Effect} />
				))}
			</Grid>
		</Section>
	);
}

function EffectItem({ Effect }: { Effect: EffectItem }) {
	//
	// A. Setup variables
	const realtimeContext = useRealtimeCreateContext();

	//
	// B. Handle Actions
	const handleEffectSelection = () => {
		realtimeContext.data.form.setFieldValue('effect', Effect.value);
		realtimeContext.actions.nextStep();
	};

	//
	// C. Render components
	return (
		<div className={styles.effectItem} onClick={handleEffectSelection}>
			<div className={styles.effectItemIcon}>{Effect.icon}</div>
			<div className={styles.effectItemLabel}>{Effect.label}</div>
		</div>
	);
}
