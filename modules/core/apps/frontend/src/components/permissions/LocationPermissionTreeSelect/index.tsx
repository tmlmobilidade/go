/* * */

import { AllowAllFlagValue } from '@tmlmobilidade/go-types-permissions';
import { TreeSelect, type TreeSelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';

/* * */

interface LocationPermissionTreeSelectProps {
	disabled?: boolean
	onChange: (value: string[]) => void
	options: TreeSelectDataItem[]
	value: string[]
}

/* * */

export function LocationPermissionTreeSelect({ disabled, onChange, options, value }: LocationPermissionTreeSelectProps) {
	//

	//
	// A. Transform data

	const optionsWithAllowAll = useMemo(() => {
		const copyOfOptions = [...options];
		copyOfOptions.unshift({ label: 'Todas as localizações', value: AllowAllFlagValue });
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
		<TreeSelect
			data={optionsWithAllowAll}
			description="Localizações às quais o utilizador tem acesso para esta acção."
			disabled={disabled}
			label="Localizações"
			mode="multiple"
			onChange={handleChange}
			placeholder="Selecione uma ou mais localizações..."
			value={value}
		/>
	);
}
