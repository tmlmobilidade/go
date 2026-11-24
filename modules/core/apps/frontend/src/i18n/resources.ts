'use client';

import namespaceAgenciesEn from '@/i18n/namespaces/agencies/en.json' with { type: 'json' };
import namespaceAgenciesEs from '@/i18n/namespaces/agencies/es.json' with { type: 'json' };
import namespaceAgenciesPt from '@/i18n/namespaces/agencies/pt.json' with { type: 'json' };
import namespaceDefaultEn from '@/i18n/namespaces/default/en.json' with { type: 'json' };
import namespaceDefaultEs from '@/i18n/namespaces/default/es.json' with { type: 'json' };
import namespaceDefaultPt from '@/i18n/namespaces/default/pt.json' with { type: 'json' };
import namespaceOrganizationsEn from '@/i18n/namespaces/organizations/en.json' with { type: 'json' };
import namespaceOrganizationsEs from '@/i18n/namespaces/organizations/es.json' with { type: 'json' };
import namespaceOrganizationsPt from '@/i18n/namespaces/organizations/pt.json' with { type: 'json' };
import namespaceUnauthenticatedEn from '@/i18n/namespaces/unauthenticated/en.json' with { type: 'json' };
import namespaceUnauthenticatedEs from '@/i18n/namespaces/unauthenticated/es.json' with { type: 'json' };
import namespaceUnauthenticatedPt from '@/i18n/namespaces/unauthenticated/pt.json' with { type: 'json' };
import { i18nResourceKeysEnShared, i18nResourceKeysEsShared, i18nResourceKeysPtShared } from '@tmlmobilidade/ui';

/**
 * Resource keys for i18n translations in Portuguese.
 * These keys map to the respective translation files
 * for each language and namespace. They are the glue that
 * connects the i18n system to the actual translation strings.
 * Don't forget to import shared keys from the UI package.
 */
export const i18nResourceKeysPt = {
	...i18nResourceKeysPtShared,
	agencies: namespaceAgenciesPt,
	default: namespaceDefaultPt,
	organizations: namespaceOrganizationsPt,
	unauthenticated: namespaceUnauthenticatedPt,
} as const;

/**
 * Resource keys for i18n translations in Spanish.
 */
export const i18nResourceKeysEs = {
	...i18nResourceKeysEsShared,
	agencies: namespaceAgenciesEs,
	default: namespaceDefaultEs,
	organizations: namespaceOrganizationsEs,
	unauthenticated: namespaceUnauthenticatedEs,
} as const;

/**
 * Resource keys for i18n translations in English.
 */
export const i18nResourceKeysEn = {
	...i18nResourceKeysEnShared,
	agencies: namespaceAgenciesEn,
	default: namespaceDefaultEn,
	organizations: namespaceOrganizationsEn,
	unauthenticated: namespaceUnauthenticatedEn,
} as const;
