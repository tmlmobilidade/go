/* * */

export const getCssVariableValue = (variableName: string) => {
	if (typeof globalThis.window === 'undefined') return undefined;
	return globalThis.window.getComputedStyle(globalThis.document.documentElement)
		.getPropertyValue(variableName)
		.trim();
};
