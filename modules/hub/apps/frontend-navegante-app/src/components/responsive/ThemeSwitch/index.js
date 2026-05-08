/* * */

/**
 * Use to show children only when dark theme is active. Hidden otherwise.
 * @param children The content to display in dark theme.
 * @returns The rendered ThemeDark component.
 */
export function ThemeDark({ children }) {
	return (
		<theme-dark>
			{children}
		</theme-dark>
	);
}

/**
 * Use to show children only when light theme is active. Hidden otherwise.
 * @param children The content to display in light theme.
 * @returns The rendered ThemeLight component.
 */
export function ThemeLight({ children }) {
	return (
		<theme-light>
			{children}
		</theme-light>
	);
}

/**
 * ThemeSwitch component to automatically toggle children components between dark and light themes.
 * @param dark The content to display in dark theme.
 * @param light The content to display in light theme.
 * @returns The rendered ThemeSwitch component.
 */

export function ThemeSwitch({ dark, light }) {
	return (
		<>
			<ThemeDark>
				{dark}
			</ThemeDark>
			<ThemeLight>
				{light}
			</ThemeLight>
		</>
	);
}
