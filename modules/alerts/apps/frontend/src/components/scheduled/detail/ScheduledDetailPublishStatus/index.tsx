'use client';

/* * */

import { AlertTagPublishStatus } from '@/components/common/AlertTagPublishStatus';
import { useScheduledDetailContext } from '@/components/scheduled/detail/ScheduledDetail.context';
import { Translations } from '@/lib/translations';
import { PublishStatusSchema } from '@tmlmobilidade/types';
import { Select } from '@tmlmobilidade/ui';
import { useState } from 'react';

/* * */

export function ScheduledDetailPublishStatus() {
	//

	//
	// A. Setup variables

	const scheduledDetailContext = useScheduledDetailContext();

	const [isEditing, setIsEditing] = useState(false);

	//
	// B. Transform data

	const publishStatusOptions = PublishStatusSchema.options.map(item => ({
		label: Translations.PUBLISH_STATUS[item],
		value: item,
	}));

	//
	// C. Render components

	if (!isEditing) {
		return (
			<AlertTagPublishStatus
				onClick={() => setIsEditing(true)}
				value={scheduledDetailContext.data.form.getValues().publish_status}
			/>
		);
	}

	return (
		<Select
			key={scheduledDetailContext.data.form.key('publish_status')}
			clearable={false}
			data={publishStatusOptions}
			onDropdownClose={() => setIsEditing(false)}
			autoFocus
			{...scheduledDetailContext.data.form.getInputProps('publish_status')}
		/>
	);

	//
}
