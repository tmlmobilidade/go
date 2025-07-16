'use client';

/* * */

import { StopListHeader } from '@/components/Stops/List/StopListHeader';
import { useStopListContext } from '@/contexts/StopList.context';
import { Pane, Section, Tag, Text } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function StopsList() {
	//

	//
	// A. Setup variables

	const { data, flags } = useStopListContext();

	//
	// B. Render components

	if (flags.error) {
		return <div>Error: {flags.error.message}</div>;
	}

	return (
		<Pane header={[<StopListHeader />]}>
			{data.raw.map(stop => (
				<div key={stop._id} className={styles.root}>
					<Section alignItems="center" flexDirection="row" flexWrap="nowrap" gap="sm">
						<Tag label={stop._id} variant="muted" />
						<Text size="lg">{stop.new_name}</Text>
					</Section>
				</div>
			))}
		</Pane>

	);

	//
}
