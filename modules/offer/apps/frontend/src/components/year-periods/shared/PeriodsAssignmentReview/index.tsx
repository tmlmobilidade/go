'use client';

import { Alert, Button, ErrorDisplay, Section, Text } from '@tmlmobilidade/ui';
import { useTranslation } from 'react-i18next';

import { type UsePeriodsAssignmentReviewReturnType } from '../use-periods-assignment-review';

/* * */

export function PeriodsAssignmentReview({ disabled = false, review }: { disabled?: boolean, review: UsePeriodsAssignmentReviewReturnType }) {
	//

	//
	// A. Setup variables

	const { t } = useTranslation();

	//
	// B. Render components

	return (
		<>
			{review.isChecking && <Text size="sm">{t('default:periods.assignment.checking')}</Text>}
			{review.error && <ErrorDisplay message={review.error} />}
			{!!review.conflicts.length && (
				<Alert title={t('default:periods.assignment.conflictTitle')} variant="warning">
					<Section gap="md" padding="none">
						<Text size="sm">{t('default:periods.assignment.conflictMessage', { count: review.conflicts.reduce((sum, conflict) => sum + conflict.dates.length, 0), periods: review.conflicts.map(conflict => conflict.year_period.name).join(', ') })}</Text>
						{!review.acknowledged && !review.error && <Button disabled={disabled || review.isChecking} label={t('default:periods.assignment.acknowledge')} onClick={review.acknowledge} />}
					</Section>
				</Alert>
			)}
		</>
	);
}
