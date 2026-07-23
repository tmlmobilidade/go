'use client';

import { FeedbackTrigger } from '@/components/feedback/FeedbackButton';

/* * */

interface FeedbackStartPromptProps {
	onClick: () => void
}

/* * */

export function FeedbackStartPrompt({ onClick }: FeedbackStartPromptProps) {
	return <FeedbackTrigger onClick={onClick} />;
}
