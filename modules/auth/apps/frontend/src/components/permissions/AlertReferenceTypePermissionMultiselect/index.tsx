/* * */

import { AlertReferenceTypeSchema, PermissionCatalog } from '@tmlmobilidade/types';
import { MultiSelect } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

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

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const alertReferenceTypeOptionsWithAllowAll = [
		{ label: t('auth:permissions.AlertReferenceTypePermissionMultiselect.alertReferenceTypeOptionsWithAllowAll.all'), value: PermissionCatalog.ALLOW_ALL_FLAG },
		{ label: t('auth:permissions.AlertReferenceTypePermissionMultiselect.alertReferenceTypeOptionsWithAllowAll.lines'), value: AlertReferenceTypeSchema.enum.lines },
		{ label: t('auth:permissions.AlertReferenceTypePermissionMultiselect.alertReferenceTypeOptionsWithAllowAll.stops'), value: AlertReferenceTypeSchema.enum.stops },
		{ label: t('auth:permissions.AlertReferenceTypePermissionMultiselect.alertReferenceTypeOptionsWithAllowAll.rides'), value: AlertReferenceTypeSchema.enum.rides },
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
			description={t('auth:permissions.AlertReferenceTypePermissionMultiselect.description')}
			disabled={disabled}
			label={t('auth:permissions.AlertReferenceTypePermissionMultiselect.label')}
			onChange={handleChange}
			value={value}
		/>
	);

	//
}
