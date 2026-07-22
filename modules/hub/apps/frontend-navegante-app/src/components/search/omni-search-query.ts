let LAST_OMNI_SEARCH_QUERY = '';
const omniSearchQueryListeners = new Set<() => void>();

/* * */

function emitOmniSearchQueryChange() {
	omniSearchQueryListeners.forEach(listener => listener());
}

/* * */

export function subscribeToOmniSearchQuery(listener: () => void) {
	omniSearchQueryListeners.add(listener);
	return () => {
		omniSearchQueryListeners.delete(listener);
	};
}

export function getLastOmniSearchQuery() {
	return LAST_OMNI_SEARCH_QUERY;
}

export function clearLastOmniSearchQuery() {
	if (LAST_OMNI_SEARCH_QUERY === '') return;
	LAST_OMNI_SEARCH_QUERY = '';
	emitOmniSearchQueryChange();
}

export function setLastOmniSearchQuery(value: string) {
	if (LAST_OMNI_SEARCH_QUERY === value) return;
	LAST_OMNI_SEARCH_QUERY = value;
	emitOmniSearchQueryChange();
}
