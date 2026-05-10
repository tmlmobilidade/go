'use client';
/* * */

import { useGlobalSettingsContext } from '@/contexts/GlobalSettings.context';
import { TRANSPORT_AGENCY_IDS } from '@/utils/transportAgencies';
import { MultiSelect } from '@mantine/core';
import { IconHomeHeart } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

export function HomePageFilterbarAgencies() {
	//

	//
	// A. Setup variables

	const t = useTranslations('home.HomePageFilterbar');
	const globalSettingsContext = useGlobalSettingsContext();
	const optionsLabels = useTranslations('home.HomePageFilterbar.options');

	//
	// B. Transform Data
	const agencyOptions = useMemo(() => {
		const configuredAgencyIds = Array.from(
			new Set(Object.values(TRANSPORT_AGENCY_IDS).flatMap(ids => ids)),
		).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
		return configuredAgencyIds.map(value => ({ label: optionsLabels(`Agency.${value}`), value }));
	}, [optionsLabels]);

	//
	// C. Render Components

	return (
		<MultiSelect
			data={agencyOptions}
			leftSection={<IconHomeHeart />}
			onChange={globalSettingsContext.actions.updateFilterByAgency}
			placeholder={t('filters.by_agency.placeholder')}
			value={globalSettingsContext.filterbar.by_agency}
			clearable
			searchable
		/>
	);

	//
}
