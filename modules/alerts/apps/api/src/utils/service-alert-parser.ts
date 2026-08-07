import { type Line } from '@carrismetropolitana/api-types/network';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { storageProvider } from '@tmlmobilidade/go-providers-storage';
import { type ServiceAlertResponseItem } from '@tmlmobilidade/types';
import { Alert, Attachment } from '@tmlmobilidade/types';
import { type EntitySelector } from 'gtfs-types';

async function parseServiceAlert(alert: Alert, lines: Line[]): Promise<ServiceAlertResponseItem> {
	const informedEntity = (): EntitySelector[] => {
		const informedEntity: EntitySelector[] = [];

		switch (alert.reference_type) {
			case 'agency':
				informedEntity.push({
					agency_id: alert.references[0].parent_id,
				});
				break;
			case 'lines':
				alert.references.forEach((reference) => {
					const line = lines.find(line => line.id === reference.parent_id);
					for (const routeId of line?.route_ids ?? []) {
						if (reference.child_ids.length === 0) {
							const entity = {
								route_id: routeId,
							};
							informedEntity.push(entity);
						} else {
							reference.child_ids.forEach((childId) => {
								const entity = {
									route_id: routeId,
									stop_id: childId,
								};
								informedEntity.push(entity);
							});
						}
					}
				});
				break;
			case 'rides':
				alert.references.forEach((reference) => {
					informedEntity.push({
						trip: {
							// TODO: Should fetch from rides collection instead of regexing
							trip_id: `[${reference.parent_id.split('-').shift() ?? ''}]${reference.parent_id.split('-').pop() ?? ''}`, // "[plan_id]-[trip_id]"
						},
					});
				});
				break;
			case 'stops':
				alert.references.forEach((reference) => {
					if (reference.child_ids.length === 0) {
						informedEntity.push({
							stop_id: reference.parent_id,
						});
					} else {
						reference.child_ids.forEach((childId) => {
							for (const routeId of lines.find(line => line.id === childId)?.route_ids ?? []) {
								informedEntity.push({
									route_id: routeId,
									stop_id: reference.parent_id,
								});
							}
						});
					}
				});
				break;
			default:
				throw new HttpException(HTTP_STATUS.BAD_REQUEST, `Invalid reference type: ${alert.reference_type}`);
		}

		return informedEntity;
	};

	let attachment: Attachment | null = null;
	try {
		attachment = await storageProvider.findById(alert.file_id);
	} catch (error) {
		console.error(error);
	}

	return {
		alert: {
			active_period: [
				{
					end: alert.active_period_end_date ? alert.active_period_end_date / 1000 : undefined,
					start: alert.active_period_start_date / 1000,
				},
			],
			cause: alert.cause,
			coordinates: alert.coordinates?.length === 2 ? [alert.coordinates[0], alert.coordinates[1]] : undefined,
			description_text: {
				translation: [
					{
						language: 'pt',
						text: alert.description,
					},
				],
			},
			effect: alert.effect,
			header_text: {
				translation: [
					{
						language: 'pt',
						text: alert.title,
					},
				],
			},
			image: attachment ? {
				localized_image: [
					{
						language: 'pt',
						media_type: attachment.type ?? 'image/png',
						url: attachment.url ?? '',
					},
				],
			} : undefined,
			informed_entity: informedEntity(),
			url: {
				translation: [
					{
						language: 'pt-PT',
						text: alert.info_url ?? '',
					},
				],
			},
		},
		id: alert._id,
	};
}

export { parseServiceAlert };
