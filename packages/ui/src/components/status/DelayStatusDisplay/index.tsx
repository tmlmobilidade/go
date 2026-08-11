'use client';

import { type DelayStatus, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { displayDuration, Tag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface DelayStatusDisplayProps {

	/**
	 * The end timestamp.
	 */
	endTimestamp?: null | UnixTimestamp

	/**
	 * The start timestamp.
	 */
	startTimestamp?: null | UnixTimestamp

	/**
	 * The delay status.
	 */
	status?: DelayStatus | null
}

/* * */

export function DelayStatusDisplay({ endTimestamp, startTimestamp, status }: DelayStatusDisplayProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const durationValue = useMemo(() => {
		return displayDuration(startTimestamp, endTimestamp);
	}, [startTimestamp, endTimestamp]);

	//
	// C. Render components

	if (!status) {
		return null;
	}

	if (status === 'ontime') {
		return (
			<>
				{!durationValue && <Tag label={t('shared:status.delay_status.ontime')} variant="success" />}
				{durationValue && <Tag label={durationValue} variant="success" />}
			</>
		);
	}

	if (status === 'delayed') {
		return (
			<>
				{!durationValue && <Tag label={t('shared:status.delay_status.delayed')} variant="warning" />}
				{durationValue && <Tag label={durationValue} variant="warning" />}
			</>
		);
	}

	if (status === 'early') {
		return (
			<>
				{!durationValue && <Tag label={t('shared:status.delay_status.early')} variant="danger" />}
				{durationValue && <Tag label={durationValue} variant="danger" />}
			</>
		);
	}
}
