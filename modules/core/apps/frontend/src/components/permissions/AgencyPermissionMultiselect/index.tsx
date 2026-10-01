/* * */

import { AllowAllFlagValue } from '@tmlmobilidade/go-types-permissions';
import { MultiSelect, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface AgencyPermissionMultiselectProps {
	disabled?: boolean
	onChange: (value: string[]) => void
	options: SelectDataItem[]
	value: string[]
}

/* * */

export function AgencyPermissionMultiselect({ disabled, onChange, options, value }: AgencyPermissionMultiselectProps) {
	//

	//
	// A. Transform data

	const optionsWithAllowAll = useMemo(() => {
		const copyOfOptions = [...options];
		copyOfOptions.unshift({ label: 'Todas as agências', value: AllowAllFlagValue });
		return copyOfOptions;
	}, [options]);

	//
	// B. Handle actions

	const handleChange = (newValue: string[]) => {
		// Handle "select all" logic
		if (value.includes(AllowAllFlagValue)) {
			const filteredValue = newValue.filter(v => v !== AllowAllFlagValue);
			onChange(filteredValue);
			return;
		}
		// If "select all" is chosen, set the newValue accordingly
		if (newValue.includes(AllowAllFlagValue)) {
			onChange([AllowAllFlagValue]);
			return;
		}
		// Handle normal change
		onChange(newValue);
	};

	//
	// C. Render components

	return (
		<MultiSelect
			data={optionsWithAllowAll}
			description="Operadores ao qual o utilizador tem acesso para esta acção."
			disabled={disabled}
			label="Operadores"
			onChange={handleChange}
			value={value}
		/>
	);
}
