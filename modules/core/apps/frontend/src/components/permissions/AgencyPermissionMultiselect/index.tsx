'use client';

import { AllowAllFlagValue } from '@tmlmobilidade/go-types-permissions';
import { MultiSelect, type SelectDataItem } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

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
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const optionsWithAllowAll = useMemo(() => {
		const copyOfOptions = [...options];
		copyOfOptions.unshift({ label: t('default:permissions.AgencyPermissionMultiselect.all'), value: AllowAllFlagValue });
		return copyOfOptions;
	}, [options, t]);

	//
	// C. Handle actions

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
	// D. Render components

	return (
		<MultiSelect
			data={optionsWithAllowAll}
			description={t('default:permissions.AgencyPermissionMultiselect.description')}
			disabled={disabled}
			label={t('default:permissions.AgencyPermissionMultiselect.label')}
			onChange={handleChange}
			value={value}
		/>
	);
}
