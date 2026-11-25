'use client';

import { useEffect } from 'react';

/* * */

export function NativeSafeArea() {
	//

	//
	// A. Setup native safe area

	useEffect(() => {
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
		const isWebView = !/Safari|CriOS|FxiOS|EdgiOS|OPiOS/.test(navigator.userAgent);
		if (!isIOS || !isWebView) return;

		document.documentElement.setAttribute('data-native-ios', '');
		return () => document.documentElement.removeAttribute('data-native-ios');
	}, []);

	//
	// B. Render components

	return null;

	//
}
