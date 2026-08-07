/* * */

export function getItemPathname(href: string) {
	if (URL.canParse(href)) return new URL(href).pathname;
	const hrefWithoutQuery = href.split('?')[0];
	const hrefWithoutHash = hrefWithoutQuery.split('#')[0];
	return hrefWithoutHash;
}

export function normalizePathname(pathname: string) {
	if (pathname === '/') return '/';
	const normalized = pathname.replace(/\/+$/, '');
	return normalized.length ? normalized : '/';
}

export function isItemActive(href: string, currentPathname?: string) {
	if (!currentPathname) return false;
	const itemPathname = normalizePathname(getItemPathname(href));
	const current = normalizePathname(currentPathname);
	if (itemPathname === '/') return current === '/';
	return current === itemPathname || current.startsWith(`${itemPathname}/`);
}
