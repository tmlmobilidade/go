'use client';

import { useLocalStorage } from '@mantine/hooks';

interface UseSelectedStopReturnType {
	selectedStopId: null | string
	selectStopId: (stopId: null | string) => void
}

/**
 * A hook that provides the selected stop id.
 * @returns An object with the selected stop id, if any, and a function to select a stop.
 */
export function useSelectedStop(): UseSelectedStopReturnType {
	//

	//
	// A. Setup variables

	const [selectedStopId, setSelectedStopId] = useLocalStorage<null | string>({
		defaultValue: null,
		key: 'selected-stop-id',
	});

	//
	// B. Handle actions

	const handleSelectStopId = (stopId: string) => {
		setSelectedStopId(stopId);
	};

	//
	// C. Return data

	return {
		selectedStopId: selectedStopId ?? null,
		selectStopId: handleSelectStopId,
	};
}
