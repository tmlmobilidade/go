'use client';

import { useStopsDetailFormContext } from '@/components/stops/detail/StopsDetailForm.context';
import { useStopsDetailData } from '@/components/stops/detail/use-stops-detail-data';
import { IconBus, IconPencil } from '@tabler/icons-react';
import { locationSlotOsmIds } from '@tmlmobilidade/go-types-locations';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Divider, IconButton, Label, Section, Surface, Text, useMeData, useStandardFormWatch } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './styles.module.css';

import { openStopsDetailUpdateNameModal } from '../StopsDetailUpdateName.modal';

/* * */

export function StopsDetailUpdateName() {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	const { data } = useStopsDetailData();

	const { data: meData } = useMeData();

	const { capabilities, form } = useStopsDetailFormContext();

	const nameValue = useStandardFormWatch({ control: form.control, name: 'name' });
	const shortNameValue = useStandardFormWatch({ control: form.control, name: 'short_name' });
	const ttsNameValue = useStandardFormWatch({ control: form.control, name: 'tts_name' });

	//
	// B. Setup flags

	const canUpdateName = useMemo(() => {
		if (!data?.location) return false;
		const hasPermission = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.stops.actions.edit_name,
			permissions: meData?.permissions,
			resource_key: 'location_ids',
			scope: PermissionCatalog.all.stops.scope,
			value: locationSlotOsmIds(data.location),
		});
		return hasPermission && !capabilities.updateEnabled;
	}, [data?.location, meData?.permissions, capabilities.updateEnabled]);

	//
	// C. Render components

	return (
		<Section gap="md" padding="none">
			<Surface variant="bordered" withBackground>
				<Section alignItems="flex-start" flexDirection="row" gap="md" justifyContent="space-between" padding="md">
					<Section alignItems="flex-start" flexDirection="row" gap="md" padding="none">
						<div className={styles.iconWrapper} aria-hidden>
							<IconBus size={22} stroke={1.5} />
						</div>
						<Section gap="sm" padding="none">
							{/* Name */}
							<Section gap="xs" padding="none">
								<Label size="sm" variant="muted" caps>{t('default:stops.detail.SectionGeneral.stop_name')}</Label>
								<Text size="base" weight="semibold">{nameValue || t('default:stops.shared.not_available')}</Text>
							</Section>
							<Divider />

							{/* Short Name */}
							<Section gap="xs" padding="none">
								<Label size="sm" variant="muted" caps>{t('default:stops.detail.SectionGeneral.short_name')}</Label>
								<Text size="base" weight="semibold">{shortNameValue || t('default:stops.shared.not_available')}</Text>
							</Section>
							<Divider />

							{/* TTS Name */}
							<Section gap="xs" padding="none">
								<Label size="sm" variant="muted" caps>{t('default:stops.detail.SectionGeneral.tts_name')}</Label>
								<Text size="base" weight="semibold">{ttsNameValue || t('default:stops.shared.not_available')}</Text>
							</Section>
						</Section>
					</Section>
					<IconButton
						icon={<IconPencil size={18} stroke={1.5} />}
						isDisabled={!canUpdateName}
						onClick={openStopsDetailUpdateNameModal}
						variant="subtle"
					/>
				</Section>
			</Surface>
		</Section>
	);
}
