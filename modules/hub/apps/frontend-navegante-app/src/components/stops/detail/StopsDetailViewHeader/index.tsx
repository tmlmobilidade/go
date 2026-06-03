'use client';

import { CopyBadge } from '@/components/common/CopyBadge';
import { IconDisplay } from '@/components/common/IconDisplay';
import { LineBadge } from '@/components/lines/common/LineBadge';
import { SelectOperationalDate } from '@/components/lines/common/SelectOperationalDate';
import { StopDisplayLocation } from '@/components/stops/common/StopDisplayLocation';
import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { Section, StopDisplayName, Surface } from '@tmlmobilidade/ui';

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

				<div className={styles.nameWrapper}>
					<StopDisplayName longName={stopsDetailContext.data.stop.name} size="lg" />
				</div>
				<StopDisplayLocation localityName={stopsDetailContext.data.stop.locality_name} municipalityName={stopsDetailContext.data.stop.municipality_name} size="lg" />

			</Section>
			<Section padding="md">

				{stopsDetailContext.data.stop.flags.length > 0 && (
					<>
						{stopsDetailContext.data.stop.flags.map((flag, index) => (
							<div key={index} className={styles.iconFacilityWrapper}>
								<IconDisplay key={flag.short_name} category="facilities" name={flag.short_name} />
							</div>
						))}
						<div className={styles.iconsDivider} />
					</>
				)}

				{stopsDetailContext.data.lines?.map(line => (
					<div key={line._id} className={styles.iconLineBadgeWrapper}>
						<LineBadge key={line._id} lineData={line} />
					</div>
				))}

				<SelectOperationalDate />

			</Section>
		</Surface>
	);
}
