'use client';

import { useStopsDetailFormContext } from '@/components/stops/detail/StopsDetailForm.context';
import { useStopsDetailData } from '@/components/stops/detail/use-stops-detail-data';
import { IconBrandGoogleMaps, IconMapPin, IconPencil } from '@tabler/icons-react';
import { locationSlotOsmIds } from '@tmlmobilidade/go-types-locations';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, Label, Section, Surface, Text, useMeData, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { openStopsDetailUpdateCoordinatesModal } from '../StopsDetailUpdateCoordinates.modal';

/* * */

export function StopsDetailUpdateCoordinates() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data } = useStopsDetailData();

	const { data: meData } = useMeData();

	const { capabilities, form } = useStopsDetailFormContext();

	const latitudeValue = useStandardFormWatch({ control: form.control, name: 'latitude' });
	const longitudeValue = useStandardFormWatch({ control: form.control, name: 'longitude' });

	//
	// B. Setup flags

	const canUpdateCoordinates = useMemo(() => {
		if (!data?.location) return false;
		const hasPermission = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.stops.actions.edit_coordinates,
			permissions: meData?.permissions,
			resource_key: 'location_ids',
			scope: PermissionCatalog.all.stops.scope,
			value: locationSlotOsmIds(data.location),
		});
		return hasPermission && !capabilities.updateEnabled;
	}, [data?.location, meData?.permissions, capabilities.updateEnabled]);

	//
	// C. Transform data

	const coordinatesDisplay = useMemo(() => {
		if (typeof latitudeValue !== 'number' || typeof longitudeValue !== 'number') {
			return t('default:stops.shared.not_available');
		}
		return `${latitudeValue.toFixed(6)}, ${longitudeValue.toFixed(6)}`;
	}, [latitudeValue, longitudeValue, t]);

	const googleMapsHref = useMemo(() => {
		if (typeof latitudeValue !== 'number' || typeof longitudeValue !== 'number') return undefined;
		return `https://www.google.com/maps/search/?api=1&query=${latitudeValue},${longitudeValue}`;
	}, [latitudeValue, longitudeValue]);

	//
	// D. Render components

	return (
		<Surface variant="bordered" withBackground>
			<Section alignItems="flex-start" flexDirection="row" gap="md" justifyContent="space-between" padding="md">
				<Section alignItems="flex-start" flexDirection="row" gap="md" padding="none">
					<div className={styles.iconWrapper} aria-hidden>
						<IconMapPin size={22} stroke={1.5} />
					</div>
					<Section gap="xs" padding="none">
						<Label size="sm" variant="muted" caps>{t('default:stops.detail.SectionGeneral.coordinates')}</Label>
						<Text size="base" weight="semibold">{coordinatesDisplay}</Text>
					</Section>
				</Section>
				<Section alignItems="flex-end" flexDirection="column" flexWrap="nowrap" gap="md" padding="none">
					<Button
						disabled={!canUpdateCoordinates}
						icon={<IconPencil size={18} stroke={1.5} />}
						label={t('default:stops.detail.UpdateCoordinates.EditLink.label')}
						onClick={openStopsDetailUpdateCoordinatesModal}
						variant="secondary"
					/>
					{googleMapsHref && (
						<Button
							href={googleMapsHref}
							icon={<IconBrandGoogleMaps size={18} stroke={1.5} />}
							label={t('default:stops.detail.SectionGeneral.open_in_google_maps')}
							target="_blank"
							variant="transparent"
						/>
					)}
				</Section>
			</Section>
		</Surface>
	);
}
