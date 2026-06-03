'use client';

import { useLocalStorage } from '@mantine/hooks';

interface UseSelectedLineReturnType {
	selectedLineId: string
	selectLineId: (lineId: string) => void
}

/**
 * A hook that provides the selected line id.
 * @returns An object with the selected line id, if any, and a function to select a line.
 */
export function useSelectedLine(): UseSelectedLineReturnType {
	//

	//
	// A. Setup variables

	const [selectedLineId, setSelectedLineId] = useLocalStorage<null | string>({
		defaultValue: null,
		key: 'selected-line-id',
	});

	//
	// B. Handle actions

	const handleSelectLineId = (lineId: string) => {
		setSelectedLineId(lineId);
	};

	//
	// C. Return data

	return {
		selectedLineId: selectedLineId ?? null,
		selectLineId: handleSelectLineId,
	};
}
