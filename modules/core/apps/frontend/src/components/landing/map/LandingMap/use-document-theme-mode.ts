'use client';

import { type ThemeMode } from '@tmlmobilidade/go-types-shared';
import { useEffect, useState } from 'react';

/* * */

/**
 * Reads `data-mode` from the document and re-reads it whenever it changes,
 * since the landing mode toggle sets it directly instead of through user preferences.
 */
export function useDocumentThemeMode() {
	const [mode, setMode] = useState<ThemeMode>('light');

	useEffect(() => {
		const read = () => setMode(document.documentElement.getAttribute('data-mode') === 'dark' ? 'dark' : 'light');
		read();
		const observer = new MutationObserver(read);
		observer.observe(document.documentElement, { attributeFilter: ['data-mode'], attributes: true });
		return () => observer.disconnect();
	}, []);

	return mode;
}
