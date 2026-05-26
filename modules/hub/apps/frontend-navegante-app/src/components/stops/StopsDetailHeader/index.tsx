'use client';

import { BackButton } from '@/components/common/BackButton';
import { CopyBadge } from '@/components/common/CopyBadge';
import { IconDisplay } from '@/components/common/IconDisplay';
import { Section } from '@/components/layout/Section';
import { Surface } from '@/components/layout/Surface';
import { LineBadge } from '@/components/lines/LineBadge';
import { StopDisplayLocation } from '@/components/stops/StopDisplayLocation';
import { StopDisplayName } from '@/components/stops/StopDisplayName';
import { StopDisplayTts } from '@/components/stops/StopDisplayTts';
import { useStopsDetailContext } from '@/contexts/StopsDetail.context';

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

			<Section withBottomDivider withPadding>
				<BackButton href="/?section=stops" />
			</Section>

			<Section withGap withPadding>

				<div className={styles.badgesWrapper}>
					<CopyBadge
						label={'#' + stopsDetailContext.data.stop.id}
						value={stopsDetailContext.data.stop.id}
					/>
					<CopyBadge
						hasBorder={false}
						label={`${stopsDetailContext.data.stop.lat}, ${stopsDetailContext.data.stop.lon}`}
						value={stopsDetailContext.data.stop.lat + ',' + stopsDetailContext.data.stop.lon}
					/>
				</div>

				<div className={styles.headingWrapper}>
					<div className={styles.nameWrapper}>
						<StopDisplayName longName={stopsDetailContext.data.stop.long_name} size="lg" />
						<StopDisplayTts stopId={stopsDetailContext.data.stop.id} />
					</div>
					<StopDisplayLocation localityName={stopsDetailContext.data.stop.locality_name} municipalityName={stopsDetailContext.data.stop.municipality_name} size="lg" />
				</div>

			</Section>

			<Section>
				<div className={styles.iconsWrapper}>
					{stopsDetailContext.data.stop.facilities.length > 0 && (
						<>
							{stopsDetailContext.data.stop.facilities.map((facility, index) => (
								<div key={index} className={styles.iconFacilityWrapper}>
									<IconDisplay key={facility} category="facilities" name={facility} />
								</div>
							))}
							<div className={styles.iconsDivider} />
						</>
					)}
					{stopsDetailContext.data.lines && stopsDetailContext.data.lines.map(line => (
						<div key={line.id} className={styles.iconLineBadgeWrapper}>
							<LineBadge key={line.id} lineData={line} />
						</div>
					))}
				</div>
			</Section>

		</Surface>
	);

	//
}
