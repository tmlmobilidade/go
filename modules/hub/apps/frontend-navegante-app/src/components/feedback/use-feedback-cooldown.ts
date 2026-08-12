'use client';

import { getFeedbackCooldownEndsAt, getFeedbackCooldownKey, isFeedbackCooldownActive } from '@/utils/feedback/cooldown';
import { type PublicFeedbackEntityType } from '@tmlmobilidade/go-types-public-info';
import { useEffect, useState } from 'react';

/* * */

export function useFeedbackCooldown(entityType: PublicFeedbackEntityType, entityId?: string) {
	const [isCoolingDown, setIsCoolingDown] = useState(false);

	const startCooldown = () => {
		if (!entityId) return;

		setIsCoolingDown(true);

		try {
			window.localStorage.setItem(getFeedbackCooldownKey(entityType, entityId), String(getFeedbackCooldownEndsAt()));
		} catch {
			// The in-memory cooldown still prevents another prompt during this visit.
		}
	};

	useEffect(() => {
		if (!entityId) {
			setIsCoolingDown(false);
			return;
		}

		const cooldownKey = getFeedbackCooldownKey(entityType, entityId);

		try {
			const storedEndsAt = window.localStorage.getItem(cooldownKey);

			if (isFeedbackCooldownActive(storedEndsAt)) {
				const remainingDuration = Number(storedEndsAt) - Date.now();
				setIsCoolingDown(true);

				const timeout = window.setTimeout(() => {
					window.localStorage.removeItem(cooldownKey);
					setIsCoolingDown(false);
				}, remainingDuration);

				return () => window.clearTimeout(timeout);
			}

			window.localStorage.removeItem(cooldownKey);
		} catch {
			// Storage availability must not prevent the feedback trigger from rendering.
		}

		setIsCoolingDown(false);
	}, [entityId, entityType]);

	return {
		isCoolingDown,
		startCooldown,
	};
}
