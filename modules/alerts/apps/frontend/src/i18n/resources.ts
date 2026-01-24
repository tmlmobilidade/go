'use client';

/* * */

import ptAlertCauses from '@/i18n/namespaces/alert-causes/pt.json' with { type: 'json' };
import ptAlertEffects from '@/i18n/namespaces/alert-effects/pt.json' with { type: 'json' };
import ptDefault from '@/i18n/namespaces/default/pt.json' with { type: 'json' };

/**
 * Resource keys for i18n translations.
 * These keys map to the respective translation files
 * for each language and namespace. They are the glue that
 * connects the i18n system to the actual translation strings.
 */
export const i18nRegistry = {
	pt: {
		'alert-causes': ptAlertCauses,
		'alert-effects': ptAlertEffects,
		'default': ptDefault,
	},
} as const;

/**
 * List of i18n namespaces used in the application.
 * Each namespace corresponds to a specific section
 * of the application and its associated translations.
 */
export const i18nNamespaces = [
	{ namespace: 'default', pt: ptDefault },
	{ namespace: 'alert-causes', pt: ptAlertCauses },
	{ namespace: 'alert-effects', pt: ptAlertEffects },
];
