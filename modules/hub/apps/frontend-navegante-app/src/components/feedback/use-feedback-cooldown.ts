'use client';

import { useEffect, useState } from 'react';

const FEEDBACK_COOLDOWN_DURATION_MS = 24 * 60 * 60 * 1000;

function getFeedbackCooldownKey(lineId: string) {
	return `feedback-cooldown:${lineId}`;
}

export function useFeedbackCooldown(lineId?: string) {
	const [isCoolingDown, setIsCoolingDown] = useState(false);

	const startCooldown = () => {
		if (!lineId) return;

		window.localStorage.setItem(getFeedbackCooldownKey(lineId), String(Date.now() + FEEDBACK_COOLDOWN_DURATION_MS));
		setIsCoolingDown(true);
	};

	useEffect(() => {
		if (!lineId) {
			setIsCoolingDown(false);
			return;
		}

		const cooldownKey = getFeedbackCooldownKey(lineId);
		const cooldownEndsAt = Number(window.localStorage.getItem(cooldownKey));

		if (cooldownEndsAt > Date.now()) {
			setIsCoolingDown(true);
			return;
		}

		window.localStorage.removeItem(cooldownKey);
		setIsCoolingDown(false);
	}, [lineId]);

	return {
		isCoolingDown,
		startCooldown,
	};
}
