/* * */

import { CauseIcons } from '@/lib/icons';
import { Translations } from '@/lib/translations';
import { Cause } from '@tmlmobilidade/types';
import { Grid, Section } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

interface CauseItem {
	icon: React.ReactNode
	label: string
	value: Cause
}

export function RealtimeSectionCauseSelection() {
	//
	// A. Setup variables

	const allowedCauses: Cause[] = [
		'TECHNICAL_PROBLEM', 'DEMONSTRATION', 'ACCIDENT', 'WEATHER', 'CONSTRUCTION', 'POLICE_ACTIVITY', 'MEDICAL_EMERGENCY',
	];

	const causeItems: CauseItem[] = allowedCauses.map(cause => ({
		icon: CauseIcons[cause],
		label: Translations.CAUSE[cause],
		value: cause,
	}));

	//
	// B. Render components

	return (
		<Section>
			<Grid columns="abcd" gap="xl" hAlign="center" vAlign="center">
				{causeItems.map(cause => (
					<CauseItem key={cause.value} cause={cause} />
				))}
			</Grid>
		</Section>
	);
}

function CauseItem({ cause }: { cause: CauseItem }) {
	return (
		<div className={styles.causeItem}>
			<div className={styles.causeItemIcon}>{cause.icon}</div>
			<div className={styles.causeItemLabel}>{cause.label}</div>
		</div>
	);
}
