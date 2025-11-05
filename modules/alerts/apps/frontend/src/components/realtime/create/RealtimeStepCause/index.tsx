/* * */

import { useRealtimeCreateContext } from '@/contexts/RealtimeCreate.context';
import { CauseIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { GtfsCause, gtfsCauseSchema } from '@go/types';
import { Grid, Section } from '@go/ui';

import styles from './styles.module.css';

/* * */

interface CauseItem {
	icon: React.ReactNode
	label: string
	value: GtfsCause
}

export function RealtimeStepCause() {
	//
	// A. Setup variables

	const causeItems: CauseItem[] = Object.values(gtfsCauseSchema.enum).map(cause => ({
		icon: CauseIcons[cause],
		label: Translations.CAUSE[cause],
		value: cause,
	}));

	//
	// B. Render components

	return (
		<Section>
			<Grid columns="abcde" gap="xl" hAlign="center" vAlign="center">
				{causeItems.map(cause => (
					<CauseItem key={cause.value} cause={cause} />
				))}
			</Grid>
		</Section>
	);
}

function CauseItem({ cause }: { cause: CauseItem }) {
	//
	// A. Setup variables
	const realtimeContext = useRealtimeCreateContext();

	//
	// B. Handle Actions
	const handleCauseSelection = () => {
		realtimeContext.data.form.setFieldValue('cause', cause.value);
		realtimeContext.actions.nextStep();
	};

	//
	// C. Render components
	return (
		<div className={styles.causeItem} onClick={handleCauseSelection}>
			<div className={styles.causeItemIcon}>{cause.icon}</div>
			<div className={styles.causeItemLabel}>{cause.label}</div>
		</div>
	);
}
