/** Pick error leaves so a language switch only revalidates already-visible errors. */
export function getFormErrorPaths(errors: unknown, prefix = ''): string[] {
	if (!errors || typeof errors !== 'object') return [];
	if ('type' in errors && typeof errors.type === 'string') return [prefix];
	return Object.entries(errors).flatMap(([key, value]) => getFormErrorPaths(value, prefix ? `${prefix}.${key}` : key));
}
