/* * */

/**
 * Use to show children only when desktop theme is active. Hidden otherwise.
 * @param children The content to display in desktop theme.
 * @returns The rendered BreakpointDesktop component.
 */

export function BreakpointDesktop({ children }) {
	return (
		<breakpoint-desktop>
			{children}
		</breakpoint-desktop>
	);
}

/**
 * Use to show children only when mobile theme is active. Hidden otherwise.
 * @param children The content to display in mobile theme.
 * @returns The rendered BreakpointMobile component.
 */

export function BreakpointMobile({ children }) {
	return (
		<breakpoint-mobile>
			{children}
		</breakpoint-mobile>
	);
}

/**
 * BreakpointSwitch component to automatically toggle children components between mobile and desktop themes.
 * @param mobile The content to display in mobile theme.
 * @param desktop The content to display in desktop theme.
 * @returns The rendered BreakpointSwitch component.
 */

export function BreakpointSwitch({ desktop, mobile }) {
	return (
		<>
			<BreakpointDesktop>
				{desktop}
			</BreakpointDesktop>
			<BreakpointMobile>
				{mobile}
			</BreakpointMobile>
		</>
	);
}
