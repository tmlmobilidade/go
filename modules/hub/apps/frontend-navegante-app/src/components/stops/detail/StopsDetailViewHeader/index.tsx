'use client';

import { SelectOperationalDate } from '@/components/common/operational-date/SelectOperationalDate';
import { StopDisplayLocation } from '@/components/stops/common/StopDisplayLocation';
import { CopyBadge } from '@/components/stops/detail/CopyBadge';
import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { StopsDetailViewHeaderAssociatedLines } from '@/components/stops/detail/StopsDetailViewHeaderAssociatedLines';
import { Section, Surface } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function StopsDetailViewHeader() {
	//

	//
	// A. Setup variables

	const stopsDetailContext = useStopsDetailContext();

	//
	// B. Render componentss

	return (
		<Surface variant="plain">
			<Section gap="sm">

				<div className={styles.badgesWrapper}>
					<CopyBadge
						label={'#' + stopsDetailContext.data.stop._id}
						value={stopsDetailContext.data.stop._id}
					/>
					<CopyBadge
						hasBorder={false}
						label={`${stopsDetailContext.data.stop.latitude}, ${stopsDetailContext.data.stop.longitude}`}
						value={stopsDetailContext.data.stop.latitude + ',' + stopsDetailContext.data.stop.longitude}
					/>
				</div>

				<StopDisplayLocation
					localityName={stopsDetailContext.data.stop.locality_name || 'Lisboa'}
					municipalityName={stopsDetailContext.data.stop.municipality_name}
					size="lg"
				/>

				<StopsDetailViewHeaderAssociatedLines />

				<SelectOperationalDate />

			</Section>
		</Surface>
	);
}
