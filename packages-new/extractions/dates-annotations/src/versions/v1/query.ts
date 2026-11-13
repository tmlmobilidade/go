import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { type Annotation } from '@tmlmobilidade/go-types-dates';
import { type DatesAnnotationsV1ExtractionProperties, DatesAnnotationsV1WithoutAgencyValue, DatesAnnotationsV1WithoutCategoryValue, DatesAnnotationsV1WithoutLocationValue } from '@tmlmobilidade/go-types-extractions';
import { type LocationTreeNode } from '@tmlmobilidade/go-types-locations';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/* * */

/** Builds the export criteria, intersected with current all-agency read permissions. */
export async function buildAnnotationsExtractionQuery(properties: DatesAnnotationsV1ExtractionProperties, permissions: Permission[]): Promise<Filter<Annotation>> {
	const access = PermissionCatalog.getPermissionResourceAccess<string>({
		checks: [{ action: PermissionCatalog.all.annotations.actions.read, scope: PermissionCatalog.all.annotations.scope }],
		permissions,
		resource_key: 'agency_ids',
	});
	const filters: Filter<Annotation>[] = access.allowAll ? [] : [{ agency_ids: { $not: { $elemMatch: { $nin: access.values } } } }];
	if (properties.annotation_ids) filters.push({ _id: { $in: [...new Set(properties.annotation_ids)] } });

	if (properties.agency_ids.length) {
		const choices: Filter<Annotation>[] = [{ agency_ids: { $in: properties.agency_ids.filter(id => id !== DatesAnnotationsV1WithoutAgencyValue) } }];
		if (properties.agency_ids.includes(DatesAnnotationsV1WithoutAgencyValue)) choices.push({ agency_ids: { $size: 0 } }, { agency_ids: { $exists: false } });
		filters.push({ $or: choices });
	}
	if (properties.categories.length) {
		const choices: Filter<Annotation>[] = [{ category: { $in: properties.categories.filter(value => value !== DatesAnnotationsV1WithoutCategoryValue) } }];
		if (properties.categories.includes(DatesAnnotationsV1WithoutCategoryValue)) choices.push({ category: null });
		filters.push({ $or: choices });
	}
	if (properties.start_date || properties.end_date) {
		filters.push({ dates: { $elemMatch: {
			...(properties.start_date ? { $gte: properties.start_date } : {}),
			...(properties.end_date ? { $lte: properties.end_date } : {}),
		} } });
	}
	if (properties.location_ids.length) {
		const selected = new Set(properties.location_ids.filter(id => id !== DatesAnnotationsV1WithoutLocationValue));
		const matchingIds = new Set<number>();
		const visit = (nodes: LocationTreeNode[], ancestors: number[] = [], covered = false) => {
			for (const node of nodes) {
				const id = Number(node.id);
				const isSelected = selected.has(node.id);
				if (covered || isSelected) matchingIds.add(id);
				if (isSelected) ancestors.forEach(value => matchingIds.add(value));
				visit(node.children, [...ancestors, id], covered || isSelected);
			}
		};
		if (selected.size) visit(await locationsProvider.findAdministrativeTree());
		const choices: Filter<Annotation>[] = [{ 'locations.osm_id': { $in: [...matchingIds] } }];
		if (properties.location_ids.includes(DatesAnnotationsV1WithoutLocationValue)) choices.push({ locations: { $size: 0 } }, { locations: { $exists: false } });
		filters.push({ $or: choices });
	}
	return filters.length ? { $and: filters } : {};
}
