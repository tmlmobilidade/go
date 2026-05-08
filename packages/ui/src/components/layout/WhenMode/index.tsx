'use client';

import { type PropsWithChildren, type ReactNode } from 'react';

/**
 * Use to show children only when light mode is active. Hidden otherwise.
 * @param children The content to display in light mode.
 * @returns The rendered children components.
 */
export function WhenLightMode({ children }: PropsWithChildren) {
	return (
		<div data-mode-switch="light">
			{children}
		</div>
	);
}

/**
 * Use to show children only when dark mode is active. Hidden otherwise.
 * @param children The content to display in dark mode.
 * @returns The rendered children components.
 */
export function WhenDarkMode({ children }: PropsWithChildren) {
	return (
		<div data-mode-switch="dark">
			{children}
		</div>
	);
}

/**
 * ThemeSwitch component to automatically toggle children components between dark and light modes.
 * @param dark The content to display in dark mode.
 * @param light The content to display in light mode.
 * @returns The rendered ThemeSwitch component.
 */
export function WhenMode({ dark, light }: { dark: ReactNode, light: ReactNode }) {
	return (
		<>
			<WhenLightMode>{light}</WhenLightMode>
			<WhenDarkMode>{dark}</WhenDarkMode>
		</>
	);
}
