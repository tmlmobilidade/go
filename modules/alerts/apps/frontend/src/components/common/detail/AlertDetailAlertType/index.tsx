'use client';

/* * */

import { AlertTagAlertType } from '@/components/common/AlertTagAlertType';
import { useAlertDetailContext } from '@/components/common/detail/AlertDetail.context';
import { Translations } from '@/lib/translations';
import { AlertTypeSchema } from '@tmlmobilidade/types';
import { Select } from '@tmlmobilidade/ui';
import { useState } from 'react';

/* * */

export function AlertDetailAlertType() {
	//

	//
	// A. Setup variables

	const alertDetailContext = useAlertDetailContext();

	const [isEditing, setIsEditing] = useState(false);

	//
	// B. Transform data

	const alertTypeOptions = AlertTypeSchema.options.map(item => ({
		label: Translations.ALERT_TYPE[item],
		value: item,
	}));

	//
	// C. Render components

	if (!isEditing) {
		return (
			<AlertTagAlertType
				onClick={() => setIsEditing(true)}
				value={alertDetailContext.data.form.getValues().type}
			/>
		);
	}

	return (
		<Select
			key={alertDetailContext.data.form.key('type')}
			clearable={false}
			data={alertTypeOptions}
			onDropdownClose={() => setIsEditing(false)}
			autoFocus
			{...alertDetailContext.data.form.getInputProps('type')}
		/>
	);

	//
}
