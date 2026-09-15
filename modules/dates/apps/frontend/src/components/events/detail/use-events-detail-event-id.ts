'use client';

import { useParams } from 'next/navigation';
import { useMemo } from 'react';

/* * */

interface UseEventsDetailEventIdReturnType {
	eventId: string
}

/* * */

export function useEventsDetailEventId(): UseEventsDetailEventIdReturnType {
	//

	//
	// A. Setup variables

	const params = useParams<{ id?: string }>();

	const eventId = params.id ? decodeURIComponent(params.id) : '';

	//
	// B. Return data

	return useMemo(() => ({
		eventId,
	}), [eventId]);
}
