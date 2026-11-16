'use client';

import { useStopsDetailData } from '@/components/stops/detail/use-stops-detail-data';
import { IconBuildingCommunity } from '@tabler/icons-react';
import { Divider, Label, Section, Surface, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

/* * */

export function StopsDetailLocation() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Fetch data

	const { data } = useStopsDetailData();

	const location = data?.location;

	const notAvailable = t('stops:detail.StopsDetailLocation.not_available');

	//
	// C. Render components

	return (
		<Section gap="md" padding="none">
			<Surface variant="bordered" withBackground>
				<Section alignItems="flex-start" flexDirection="row" gap="md" padding="md">
					<Section alignItems="flex-start" flexDirection="row" gap="md" padding="none">
						{/* <div className={styles.iconWrapper} aria-hidden>
							<IconBuildingCommunity size={22} stroke={1.5} />
						</div> */}
						<Section gap="sm" padding="none">
							<Section gap="xs" padding="none">
								<Label size="sm" variant="muted" caps>{t('stops:detail.StopsDetailLocation.fields.location_primary.label')}</Label>
								<Text size="base" weight="semibold">{location?.primary.name ?? notAvailable}</Text>
							</Section>
							<Divider />
							<Section gap="xs" padding="none">
								<Label size="sm" variant="muted" caps>{t('stops:detail.StopsDetailLocation.fields.location_secondary.label')}</Label>
								<Text size="base" weight="semibold">{location?.secondary.name ?? notAvailable}</Text>
							</Section>
							<Divider />
							<Section gap="xs" padding="none">
								<Label size="sm" variant="muted" caps>{t('stops:detail.StopsDetailLocation.fields.location_tertiary.label')}</Label>
								<Text size="base" weight="semibold">{location?.tertiary.name ?? notAvailable}</Text>
							</Section>
							<Divider />
							<Section gap="xs" padding="none">
								<Label size="sm" variant="muted" caps>{t('stops:detail.StopsDetailLocation.fields.location_neighbourhood.label')}</Label>
								<Text size="base" weight="semibold">{location?.neighbourhood?.name ?? notAvailable}</Text>
							</Section>
						</Section>
					</Section>
				</Section>
			</Surface>
		</Section>
	);
}
