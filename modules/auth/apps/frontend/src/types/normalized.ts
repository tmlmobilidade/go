/* * */

import { type Agency, HomeLink, Organization, type Role, type User } from '@go/types';

/* * */

export interface AgencyNormalized extends Agency {
	name_normalized: string
}

export interface OrganizationNormalized extends Organization {
	long_name_normalized: string
}

export interface QuickLinkNormalized extends HomeLink {
	long_name_normalized: string
}

/* * */

export interface RoleNormalized extends Role {
	name_normalized: string
}

/* * */

export interface UserNormalized extends User {
	first_name_normalized: string
	full_name: string
	full_name_normalized: string
	last_name_normalized: string
}
