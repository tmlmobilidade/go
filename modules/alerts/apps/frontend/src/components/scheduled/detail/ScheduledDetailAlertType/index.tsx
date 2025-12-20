'use client';

/* * */

import { AlertTagAlertType } from '@/components/common/AlertTagAlertType';
import { useScheduledDetailContext } from '@/components/scheduled/detail/ScheduledDetail.context';
import { Translations } from '@/lib/translations';
import { AlertTypeSchema } from '@tmlmobilidade/types';
import { Select } from '@tmlmobilidade/ui';
import { useState } from 'react';

/* * */

export function ScheduledDetailAlertType() {
	//

	//
	// A. Setup variables

	const scheduledDetailContext = useScheduledDetailContext();

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
				value={scheduledDetailContext.data.form.getValues().type}
			/>
		);
	}

	return (
		<Select
			key={scheduledDetailContext.data.form.key('type')}
			clearable={false}
			data={alertTypeOptions}
			onDropdownClose={() => setIsEditing(false)}
			autoFocus
			{...scheduledDetailContext.data.form.getInputProps('type')}
		/>
	);

	//
}
