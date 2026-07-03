'use client';

import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { Section, Surface } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function StopsDetailViewName() {
	//

	//
	// A. Setup variables

	const stopsDetailContext = useStopsDetailContext();

	//
	// B. Render componentss

	return (
		<Surface variant="plain">
			<Section padding="sm">
				<div className={styles.container}>
					<div />
					<p className={styles.name}>{stopsDetailContext.data.stop.name}</p>
					<div />
				</div>
			</Section>
		</Surface>
	);
}
