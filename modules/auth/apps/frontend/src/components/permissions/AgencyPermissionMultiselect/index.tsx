/* * */

import { useAgenciesContext } from '@/contexts/Agencies.context';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { MultiSelect } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

/* * */

interface AgencyPermissionMultiselectProps {
	description: string
	disabled?: boolean
	label: string
	onChange: (value: string[]) => void
	selected: string[]
}

/* * */

export function AgencyPermissionMultiselect({ description, disabled, label, onChange, selected }: AgencyPermissionMultiselectProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation('auth', { keyPrefix: 'permissions.AgencyPermissionMultiselect' });

	const agencyListContext = useAgenciesContext();

	//
	// B. Transform data

	const agencyOptions = agencyListContext.data.raw.map(agency => ({
		label: `${agency._id} - ${agency.name}`,
		value: agency._id,
	}));

	agencyOptions.unshift({
		label: t('label'),
		value: PermissionCatalog.ALLOW_ALL_FLAG,
	});

	//
	// C. Handle actions

	const handleChange = (value: string[]) => {
		if (selected.includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			const filteredValue = value.filter(v => v !== PermissionCatalog.ALLOW_ALL_FLAG);
			onChange(filteredValue);
			return;
		}

		if (value.includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			onChange([PermissionCatalog.ALLOW_ALL_FLAG]);
			return;
		}

		onChange(value);
	};

	//
	// D. Render components

	return (
		<MultiSelect
			key="agency-multiselect"
			data={agencyOptions}
			description={description}
			disabled={disabled}
			label={label}
			onChange={handleChange}
			value={selected}
		/>
	);

	//
}
