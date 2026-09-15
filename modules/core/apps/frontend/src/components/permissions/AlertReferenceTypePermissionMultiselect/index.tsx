'use client';

import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
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
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const alertReferenceTypeOptionsWithAllowAll = [
		{ label: t('default:permissions.AlertReferenceTypePermissionMultiselect.all'), value: PermissionCatalog.ALLOW_ALL_FLAG },
		{ label: t('default:permissions.AlertReferenceTypePermissionMultiselect.alertReferenceTypeOptionsWithAllowAll.lines'), value: 'lines' },
		{ label: t('default:permissions.AlertReferenceTypePermissionMultiselect.alertReferenceTypeOptionsWithAllowAll.stops'), value: 'stops' },
		{ label: t('default:permissions.AlertReferenceTypePermissionMultiselect.alertReferenceTypeOptionsWithAllowAll.rides'), value: 'rides' },
	];

	//
	// C. Handle actions

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
	// D. Render components

	return (
		<MultiSelect
			data={alertReferenceTypeOptionsWithAllowAll}
			description={t('default:permissions.AlertReferenceTypePermissionMultiselect.description')}
			disabled={disabled}
			label={t('default:permissions.AlertReferenceTypePermissionMultiselect.label')}
			onChange={handleChange}
			value={value}
		/>
	);

	//
}
