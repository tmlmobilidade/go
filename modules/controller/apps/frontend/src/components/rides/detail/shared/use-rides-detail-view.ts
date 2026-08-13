'use client';

import { useSessionStorage } from '@mantine/hooks';
import { useMemo } from 'react';

/* * */

type RidesDetailCurrentView = 'acceptance' | 'analysis' | 'audit';

interface UseRidesDetailCurrentViewReturnType {
	currentView: RidesDetailCurrentView
	setCurrentView: (view: RidesDetailCurrentView) => void
}

/* * */

export function useRidesDetailCurrentView(): UseRidesDetailCurrentViewReturnType {
	//

	//
	// A. Setup variables

	const [currentView, setCurrentView] = useSessionStorage<RidesDetailCurrentView>({
		defaultValue: 'analysis',
		key: 'rides-detail-current-view',
	});

	//
	// B. Return data

	return useMemo(() => ({
		currentView,
		setCurrentView,
	}), [currentView, setCurrentView]);
}
