/* * */

import { AgencyType } from '@/constants';
import { useAgenciesContext } from '@/contexts/Agencies.context';
import { FilterTypeList } from '@tmlmobilidade/ui';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface AgenciesSelectorProps {
	defaultToAll?: boolean
	isMultiple?: boolean
	onChange?: (values: string[]) => void
	selectedAgencies: AgencyType[]
}

export function AgenciesSelector({ defaultToAll = true, isMultiple = true, onChange, selectedAgencies }: AgenciesSelectorProps) {
	//

	//
	// A. Setup variables

	const agenciesContext = useAgenciesContext();
	const { t } = useTranslation('performance', { keyPrefix: 'AgenciesSelector' });

	// Initialize with all agencies if selectedAgencies is empty and defaultToAll is true
	useEffect(() => {
		if (
			defaultToAll
			&& selectedAgencies.length === 0
			&& agenciesContext.data.agencies.length > 0
		) {
			const allAgencyIds = agenciesContext.data.agencies.map(agency => agency.id);
			onChange?.(allAgencyIds);
		}
	}, [defaultToAll, selectedAgencies.length, agenciesContext.data.agencies, onChange]);

	//
	// B. Transform data

	const isActive = useMemo(() => {
		// The default for this filter is to show all statuses
		const defaultValues = agenciesContext.data.agencies.map(item => item.id);
		const enabledValues = selectedAgencies;
		// Check if the arrays are equal by quickly comparing their lengths
		if (defaultValues.length !== enabledValues.length) return true;
		// If the length is the same ensure they're equal by also
		// checking if every item in one array is included in the other.
		return !defaultValues.every(item => enabledValues.includes(item));
	}, [selectedAgencies, agenciesContext.data.agencies]);

	const parsedOptions = useMemo(() => {
		// Skip if options are not provided or are empty.
		if (!agenciesContext.data.agencies?.length) return [];
		// Parse options to the expected format.
		return agenciesContext.data.agencies.map(item => ({
			checked: selectedAgencies.includes(item.id),
			label: item.label,
			value: item.id,
		}));
	}, [selectedAgencies, agenciesContext.data.agencies]);

	//
	// C. Render components

	return (
		<FilterTypeList
			active={isActive}
			isMultiple={isMultiple}
			label={t('label')}
			onChange={onChange}
			options={parsedOptions}
			withToggleAll
		/>
	);

	//
}
