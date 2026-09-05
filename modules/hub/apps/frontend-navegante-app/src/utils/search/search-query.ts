let LAST_SEARCH_QUERY = '';
const searchQueryListeners = new Set<() => void>();

/* * */

function emitSearchQueryChange() {
	searchQueryListeners.forEach(listener => listener());
}

/* * */

export function subscribeToSearchQuery(listener: () => void) {
	searchQueryListeners.add(listener);
	return () => {
		searchQueryListeners.delete(listener);
	};
}

export function getLastSearchQuery() {
	return LAST_SEARCH_QUERY;
}

export function clearLastSearchQuery() {
	if (LAST_SEARCH_QUERY === '') return;
	LAST_SEARCH_QUERY = '';
	emitSearchQueryChange();
}

export function setLastSearchQuery(value: string) {
	if (LAST_SEARCH_QUERY === value) return;
	LAST_SEARCH_QUERY = value;
	emitSearchQueryChange();
}
