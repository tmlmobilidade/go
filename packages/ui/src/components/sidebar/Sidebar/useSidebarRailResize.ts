'use client';

/* * */

import { useEffect, useRef, useState } from 'react';

import { clampSidebarRailWidth } from '../sidebar-layout.constants';

/* * */

export interface UseSidebarRailResizeArgs {
	onWidthPxChange: (widthPx: number) => void
}

export function useSidebarRailResize({ onWidthPxChange }: UseSidebarRailResizeArgs) {
	const railRef = useRef<HTMLDivElement>(null);
	const [resizing, setResizing] = useState(false);

	useEffect(() => {
		if (!resizing) return;

		const onMove = (e: MouseEvent) => {
			const el = railRef.current;
			if (!el) return;
			const left = el.getBoundingClientRect().left;
			onWidthPxChange(clampSidebarRailWidth(e.clientX - left));
		};

		const onUp = () => {
			setResizing(false);
		};

		document.addEventListener('mousemove', onMove);
		document.addEventListener('mouseup', onUp);
		document.body.style.userSelect = 'none';
		document.body.style.cursor = 'col-resize';

		return () => {
			document.removeEventListener('mousemove', onMove);
			document.removeEventListener('mouseup', onUp);
			document.body.style.userSelect = '';
			document.body.style.cursor = '';
		};
	}, [onWidthPxChange, resizing]);

	return { railRef, resizing, setResizing };
}
