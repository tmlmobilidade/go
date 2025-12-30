/* * */

import { AlertReferenceTypeSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { MultiSelect } from '@tmlmobilidade/ui';

/* * */

interface AlertReferenceTypePermissionMultiselectProps {
	disabled?: boolean
	onChange: (value: string[]) => void
	value: string[]
}

/* * */

export function AlertReferenceTypePermissionMultiselect({ disabled, onChange, value }: AlertReferenceTypePermissionMultiselectProps) {
	//

	//
	// A. Transform data

	const alertReferenceTypeOptionsWithAllowAll = [
		{ label: 'Todo o tipo de referências', value: PermissionCatalog.ALLOW_ALL_FLAG },
		{ label: 'Linhas', value: AlertReferenceTypeSchema.enum.lines },
		{ label: 'Paragens', value: AlertReferenceTypeSchema.enum.stops },
		{ label: 'Circulações', value: AlertReferenceTypeSchema.enum.rides },
	];

	//
	// B. Handle actions

	const handleChange = (newValue: string[]) => {
		// Return if disabled
		if (disabled) return;
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
	// C. Render components

	return (
		<MultiSelect
			data={alertReferenceTypeOptionsWithAllowAll}
			description="Selecione os tipos de referência que este utilizador poderá utilizar."
			disabled={disabled}
			label="Tipos de Referência"
			onChange={handleChange}
			value={value}
		/>
	);

	//
}
