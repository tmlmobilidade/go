'use client';
/* * */

import { AGENCY_LOGO_BY_ID, AGENCY_LOGO_FALLBACK } from '@/components/home/agencyLogoUrls';
import { TRANSPORT_AGENCY_IDS, useGlobalSettingsContext } from '@/contexts/GlobalSettings.context';
import { Group, Image, MultiSelect, Text } from '@mantine/core';
import { IconHomeHeart } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export function FilterByAgency() {
	//

	//
	// A. Setup variables

	const t = useTranslations('filters');
	const globalSettingsContext = useGlobalSettingsContext();
	const optionsLabels = useTranslations('filters.by_agency.options');
	const configuredAgencyIds = useMemo(() => [...new Set(Object.values(TRANSPORT_AGENCY_IDS).flat())], []);

	//
	// B. Transform Data

	const agencyOptions = useMemo(() => configuredAgencyIds.map(value => ({ label: optionsLabels(`Agency.${value}`), value })), [configuredAgencyIds, optionsLabels]);

	//
	// C. Render Components

	return (
		<MultiSelect
			data={agencyOptions}
			leftSection={<IconHomeHeart />}
			onChange={globalSettingsContext.actions.updateFilterByAgency}
			placeholder={t('by_agency.placeholder')}
			value={globalSettingsContext.filterbar.by_agency}
			renderOption={({ option }) => (
				<Group gap="xs">
					<Image alt={option.label} fallbackSrc={AGENCY_LOGO_FALLBACK} fit="contain" h={16} src={AGENCY_LOGO_BY_ID[option.value] ?? AGENCY_LOGO_FALLBACK} w={36} />
					<Text size="sm">{option.label}</Text>
				</Group>
			)}
			clearable
			searchable
		/>
	);

	//
}
