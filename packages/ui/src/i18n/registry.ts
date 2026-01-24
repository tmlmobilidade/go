'use client';

/* * */

import { type Resource } from 'i18next';

import ptGlobal from '../i18n/namespaces/global/pt.json' with { type: 'json' };
import ptOperations from '../i18n/namespaces/operations/pt.json' with { type: 'json' };
import ptStatuses from '../i18n/namespaces/statuses/pt.json' with { type: 'json' };

/* * */

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface I18nRegistry extends Resource {}

/* * */

/**
 * Resource keys for i18n translations.
 * These keys map to the respective translation files
 * for each language and namespace. They are the glue that
 * connects the i18n system to the actual translation strings.
 */
export const i18nRegistry = {
	pt: {
		global: ptGlobal,
		operations: ptOperations,
		statuses: ptStatuses,
	},
} as const;

// export const i18nRegistry: { [L in keyof I18nRegistry]?: Partial<I18nRegistry[L]>; } = {};
