import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { HubV1ApiOrganizationSchema } from '@tmlmobilidade/go-types-hub';

export async function publishOrganizations() {
	const organizations = await goDb.core.organizations.findMany();
	await cacheDb.setNew('hub:v1:organizations:json', HubV1ApiOrganizationSchema.array().parse(organizations));
}
