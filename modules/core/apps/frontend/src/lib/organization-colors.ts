import { type OrganizationType } from '@tmlmobilidade/go-types-core';

export const organizationColors = {
	agency: '#D97706',
	autonomous_region: '#0891B2',
	cim: '#2563EB',
	metropolitan_area: '#7C3AED',
	municipality: '#15803D',
	other: '#64748B',
	transport_authority: '#BE185D',
	transport_network: '#0D9488',
} satisfies Record<OrganizationType, string>;
