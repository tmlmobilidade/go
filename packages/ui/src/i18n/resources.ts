'use client';

import namespaceAlertsEn from './namespaces/alerts/en.json' with { type: 'json' };
import namespaceAlertsEs from './namespaces/alerts/es.json' with { type: 'json' };
import namespaceAlertsPt from './namespaces/alerts/pt.json' with { type: 'json' };
import namespaceComponentsEn from './namespaces/components/en.json' with { type: 'json' };
import namespaceComponentsEs from './namespaces/components/es.json' with { type: 'json' };
import namespaceComponentsPt from './namespaces/components/pt.json' with { type: 'json' };
import namespaceDatatableEn from './namespaces/datatable/en.json' with { type: 'json' };
import namespaceDatatableEs from './namespaces/datatable/es.json' with { type: 'json' };
import namespaceDatatablePt from './namespaces/datatable/pt.json' with { type: 'json' };
import namespaceExtractionsEn from './namespaces/extractions/en.json' with { type: 'json' };
import namespaceExtractionsEs from './namespaces/extractions/es.json' with { type: 'json' };
import namespaceExtractionsPt from './namespaces/extractions/pt.json' with { type: 'json' };
import namespaceFiltersEn from './namespaces/filters/en.json' with { type: 'json' };
import namespaceFiltersEs from './namespaces/filters/es.json' with { type: 'json' };
import namespaceFiltersPt from './namespaces/filters/pt.json' with { type: 'json' };
import namespaceMapEn from './namespaces/map/en.json' with { type: 'json' };
import namespaceMapEs from './namespaces/map/es.json' with { type: 'json' };
import namespaceMapPt from './namespaces/map/pt.json' with { type: 'json' };
import namespaceOperationsEn from './namespaces/operations/en.json' with { type: 'json' };
import namespaceOperationsEs from './namespaces/operations/es.json' with { type: 'json' };
import namespaceOperationsPt from './namespaces/operations/pt.json' with { type: 'json' };
import namespaceStatusEn from './namespaces/status/en.json' with { type: 'json' };
import namespaceStatusEs from './namespaces/status/es.json' with { type: 'json' };
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
		datatable: namespaceDatatablePt,
		extractions: namespaceExtractionsPt,
		filters: namespaceFiltersPt,
		map: namespaceMapPt,
		operations: namespaceOperationsPt,
		status: namespaceStatusPt,
	},
} as const;

/**
 * Resource keys for i18n translations in Spanish.
 */
export const i18nResourceKeysEsShared = {
	shared: {
		alerts: namespaceAlertsEs,
		components: namespaceComponentsEs,
		datatable: namespaceDatatableEs,
		extractions: namespaceExtractionsEs,
		filters: namespaceFiltersEs,
		map: namespaceMapEs,
		operations: namespaceOperationsEs,
		status: namespaceStatusEs,
	},
} as const;

/**
 * Resource keys for i18n translations in English.
 */
export const i18nResourceKeysEnShared = {
	shared: {
		alerts: namespaceAlertsEn,
		components: namespaceComponentsEn,
		datatable: namespaceDatatableEn,
		extractions: namespaceExtractionsEn,
		filters: namespaceFiltersEn,
		map: namespaceMapEn,
		operations: namespaceOperationsEn,
		status: namespaceStatusEn,
	},
} as const;
