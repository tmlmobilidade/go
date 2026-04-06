/* * */

export function escapeXml(value: null | string | undefined): string {
	if (!value) return '';

	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

/* * */
