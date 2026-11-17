'use client';

import { IconSend } from '@tabler/icons-react';
import { API_ROUTES } from '@tmlmobilidade/consts';
import { type RideAcceptance } from '@tmlmobilidade/go-types-operation';
import { type NoteComment } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { fetchApiData, IconButton, Section, Textarea, useHandleAction } from '@tmlmobilidade/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useRidesDetailRideId } from '../../shared/use-rides-detail-ride-id';
import { useRideAcceptanceData } from '../use-ride-acceptance-data';

/* * */

export function RideAcceptanceCommentForm({ isLocked }: { isLocked: boolean }) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();
	const { rideId } = useRidesDetailRideId();
	const { mutate } = useRideAcceptanceData();
	const [comment, setComment] = useState('');

	//
	// B. Handle actions

	const { action: addComment, isLoading } = useHandleAction<RideAcceptance, NoteComment>({
		fetchFn: async body => await fetchApiData<RideAcceptance, NoteComment>({
			body,
			method: 'POST',
			url: API_ROUTES.operation.RIDE_ACCEPTANCES_COMMENT(rideId),
		}),
		onSuccess: (response) => {
			setComment('');
			mutate(response);
		},
	});

	const handleSubmit = () => {
		const message = comment.trim();
		if (isLocked || isLoading || !message) return;

		const now = Dates.now('utc').unix_milliseconds;
		void addComment({
			created_at: now,
			created_by: 'will-be-set-by-api',
			message,
			type: 'note',
			updated_at: now,
		});
	};

	//
	// C. Render components

	const placeholder = t('default:rides.acceptance.RideAcceptanceCommentForm.placeholder');

	return (
		<Section flexDirection="row" gap="md" justifyContent="flex-start" padding="none">
			<Textarea
				aria-label={placeholder}
				disabled={isLocked || isLoading}
				maxLength={300}
				maxRows={5}
				minRows={2}
				onChange={event => setComment(event.currentTarget.value)}
				placeholder={placeholder}
				value={comment}
				w="100%"
				onKeyDown={(event) => {
					if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
						event.preventDefault();
						event.currentTarget.form?.requestSubmit();
					}
				}}
				autosize
			/>
			<IconButton icon={<IconSend aria-hidden />} isDisabled={isLocked || isLoading || !comment.trim()} isLoading={isLoading} onClick={handleSubmit} />
		</Section>
	);

	//
}
