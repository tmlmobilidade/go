'use client';

/* * */

import namespaceAlertsPt from './namespaces/alerts/pt.json' with { type: 'json' };
import namespaceComponentsPt from './namespaces/components/pt.json' with { type: 'json' };
import namespaceHomePt from './namespaces/home/pt.json' with { type: 'json' };
import namespaceOperationsPt from './namespaces/operations/pt.json' with { type: 'json' };
import namespaceStatusPt from './namespaces/status/pt.json' with { type: 'json' };

/**
 * Resource keys for i18n translations in Portuguese.
 * These keys map to the respective translation files
 * for each language and namespace. They are the glue that
 * connects the i18n system to the actual translation strings.
 */
export const i18nResourceKeysPtShared = {
	shared: {
		alerts: namespaceAlertsPt,
		components: namespaceComponentsPt,
		home: namespaceHomePt,
		operations: namespaceOperationsPt,
		status: namespaceStatusPt,
	},
} as const;
