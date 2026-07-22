'use client';

import { useLinesContext } from '@/components/lines/Lines.context';
import { useMemo } from 'react';

/* * */

export function useLinesByShortName() {
	const linesContext = useLinesContext();

	return useMemo(() => {
		return new Map(linesContext.data.lines.map(line => [line.short_name, line]));
	}, [linesContext.data.lines]);
}
