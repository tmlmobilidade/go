'use client';

import { FeedbackTrigger } from '@/components/feedback/FeedbackTrigger';

/* * */

interface FeedbackStartPromptProps {
	onClick: () => void
}

/* * */

export function FeedbackStartPrompt({ onClick }: FeedbackStartPromptProps) {
	return <FeedbackTrigger onClick={onClick} />;
}
