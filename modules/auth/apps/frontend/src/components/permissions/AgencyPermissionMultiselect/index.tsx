/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { MultiSelect, useDataAgencies } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface AgencyPermissionMultiselectProps {
	disabled?: boolean
	onChange: (value: string[]) => void
	value: string[]
}

/* * */

export function AgencyPermissionMultiselect({ disabled, onChange, value }: AgencyPermissionMultiselectProps) {
	//

	//
	// A. Fetch data

	const { options: agencyOptions } = useDataAgencies(API_ROUTES.auth.AGENCIES_LIST);

	//
	// B. Transform data

	const agencyOptionsWithAllowAll = useMemo(() => {
		return [
			...agencyOptions,
			{
				label: 'Todas as agências',
				value: PermissionCatalog.ALLOW_ALL_FLAG,
			},
		];
	}, [agencyOptions]);

	//
	// C. Handle actions

	const handleChange = (newValue: string[]) => {
		// Handle "select all" logic
		if (value.includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			const filteredValue = newValue.filter(v => v !== PermissionCatalog.ALLOW_ALL_FLAG);
			onChange(filteredValue);
			return;
		}
		// If "select all" is chosen, set the newValue accordingly
		if (newValue.includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
			onChange([PermissionCatalog.ALLOW_ALL_FLAG]);
			return;
		}
		// Handle normal change
		onChange(newValue);
	};

	//
	// D. Render components

	return (
		<MultiSelect
			data={agencyOptionsWithAllowAll}
			description="Operadores ao qual o utilizador tem acesso para esta acção."
			disabled={disabled}
			label="Operadores"
			onChange={handleChange}
			value={value}
		/>
	);

	//
}
