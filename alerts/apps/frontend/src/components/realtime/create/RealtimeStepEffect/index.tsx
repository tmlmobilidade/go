/* * */

import { useRealtimeCreateContext } from '@/contexts/RealtimeCreate.context';
import { EffectIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { Effect } from '@tmlmobilidade/types';
import { Grid, Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface EffectItem {
	icon: React.ReactNode
	label: string
	value: Effect
}

export function RealtimeStepEffect() {
	//
	// A. Setup variables

	const allowedEffects: Effect[] = [
		'ADDITIONAL_SERVICE',
		'DETOUR',
		'NO_SERVICE',
		'REDUCED_SERVICE',
		'SIGNIFICANT_DELAYS',
	];

	const EffectItems: EffectItem[] = allowedEffects.map(Effect => ({
		icon: EffectIcons[Effect],
		label: Translations.EFFECT[Effect],
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
