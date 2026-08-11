'use client';

import { type DelayStatus, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';
import { displayUnixTimestamp, Section, Tag } from '@tmlmobilidade/ui';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/* * */

interface DelayStatusDisplayProps {

	/**
	 * The delay difference in minutes.
	 */
	delay?: null | number

	/**
	 * The delay status.
	 */
	status?: DelayStatus | null

	/**
	 * The timestamp of the observed time.
	 */
	timestamp?: null | UnixTimestamp
}

/* * */

export function DelayStatusDisplay({ delay, status, timestamp }: DelayStatusDisplayProps) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Transform data

	const timestampValue = useMemo(() => {
		return displayUnixTimestamp(timestamp);
	}, [timestamp]);

	const delayValue = useMemo(() => {
		let result: null | string = null;
		// Set the sign of the delay
		if (delay > 0) result = '+';
		if (delay < 0) result = '-';
		// Separate the absolute value into hours and minutes
		const hours = Math.floor(Math.abs(delay) / 60);
		const minutes = Math.abs(delay) % 60;
		// Only include hours if greater than 0
		if (hours > 0) result += `${hours}h`;
		// Only include minutes if greater than 0
		if (minutes > 0) result += `${minutes}min`;
		// Return the formatted value
		return result;
	}, [delay]);

	//
	// C. Render components

	if (!status) {
		return null;
	}

	if (status === 'ontime') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
				{timestampValue && <Tag label={timestampValue} variant="secondary" />}
				{!delayValue && <Tag label={t('shared:status.delay_status.ontime')} variant="success" />}
				{delayValue && <Tag label={delayValue} variant="success" />}
			</Section>
		);
	}

	if (status === 'delayed') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
				{timestampValue && <Tag label={timestampValue} variant="warning" />}
				{!delayValue && <Tag label={t('shared:status.delay_status.delayed')} variant="warning" />}
				{delayValue && <Tag label={delayValue} variant="warning" />}
			</Section>
		);
	}

	if (status === 'early') {
		return (
			<Section alignItems="center" flexDirection="row" gap="sm" padding="none">
				{timestampValue && <Tag label={timestampValue} variant="danger" />}
				{!delayValue && <Tag label={t('shared:status.delay_status.early')} variant="danger" />}
				{delayValue && <Tag label={delayValue} variant="danger" />}
			</Section>
		);
	}
}
