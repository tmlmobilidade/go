'use client';

/* * */

import { BackButton } from '@/components/common/BackButton';
import { CopyBadge } from '@/components/common/CopyBadge';
import { IconDisplay } from '@/components/common/IconDisplay';
import { LineBadge } from '@/components/lines/common/LineBadge';
import { StopDisplayLocation } from '@/components/stops/common/StopDisplayLocation';
import { StopDisplayName } from '@/components/stops/common/StopDisplayName';
import { useStopsDetailContext } from '@/components/stops/detail/StopsDetail.context';
import { Section, Surface } from '@tmlmobilidade/ui';

import styles from './styles.module.css';

/* * */

export function StopsDetailHeader() {
	//

	//
	// A. Setup variables

	const stopsDetailContext = useStopsDetailContext();

	//
	// B. Render components

	if (!stopsDetailContext.data.stop) {
		return null;
	}

	return (
		<Surface>

			<Section padding="md">
				<BackButton href="/?section=stops" />
			</Section>

			<Section padding="md">

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

				<div className={styles.headingWrapper}>
					<div className={styles.nameWrapper}>
						<StopDisplayName longName={stopsDetailContext.data.stop.name} size="lg" />
					</div>
					<StopDisplayLocation localityName={stopsDetailContext.data.stop.locality_name} municipalityName={stopsDetailContext.data.stop.municipality_name} size="lg" />
				</div>

			</Section>
			<Section padding="md">
				<div className={styles.iconsWrapper}>

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
				</div>
			</Section>

		</Surface>
	);

	//
}
