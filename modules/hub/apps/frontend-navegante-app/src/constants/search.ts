import { type SearchResult } from '@/types/common/search';

export const SEARCH_RESULT_TYPE_ORDER = ['stop', 'poi', 'line', 'alert'] as const satisfies readonly SearchResult['type'][];
