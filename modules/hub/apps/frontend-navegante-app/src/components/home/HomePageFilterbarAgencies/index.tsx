'use client';
/* * */

import { useGlobalSettingsContext } from '@/contexts/GlobalSettings.context';
import { TRANSPORT_AGENCY_IDS } from '@/utils/transportAgencies';
import { ComboboxItem, Group, Image, MultiSelect, Text } from '@mantine/core';
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
	const configuredAgencyIds = useMemo(() => [...new Set(Object.values(TRANSPORT_AGENCY_IDS).flat())], []);
	const agencyIdToLogo: Record<string, string> = {
		1: '/assets/logos/carris.png',
		15: '/assets/logos/fertagus.png',
		16: '/assets/logos/MTS.png',
		2: '/assets/logos/ml.png',
		21: '/assets/logos/mobicascais.png',
		3: '/assets/logos/cp.png',
		4: '/assets/logos/ttsl.png',
		41: '/assets/logos/va.png',
		42: '/assets/logos/rl.png',
		43: '/assets/logos/tst.png',
		44: '/assets/logos/alsa.png',
		51: '/assets/logos/tmp.png',
		52: '/assets/logos/tmp.png',
		53: '/assets/logos/tmp.png',
		54: '/assets/logos/tmp.png',
		55: '/assets/logos/tmp.png',
		8: '/assets/logos/tcb.png',
	};

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
			placeholder={t('filters.by_agency.placeholder')}
			value={globalSettingsContext.filterbar.by_agency}
			renderOption={({ option }: { option: ComboboxItem }) => (
				<Group gap="xs">
					<Image alt={option.label} fallbackSrc="/assets/logos/tmp.png" fit="contain" h={16} src={agencyIdToLogo[option.value]} w={20} />
					<Text size="sm">{option.label}</Text>
				</Group>
			)}
			clearable
			searchable
		/>
	);

	//
}
