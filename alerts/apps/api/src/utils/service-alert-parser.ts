import { Line } from '@carrismetropolitana/api-types/network';
import { files } from '@tmlmobilidade/core/interfaces';
import { Alert } from '@tmlmobilidade/core/types';
import { EntitySelector, Alert as ServiceAlert } from 'gtfs-types';

interface ServiceAlertExtended extends Omit<ServiceAlert, 'cause' | 'effect'> {
	cause: string
	effect: string
	file_id?: string
	image?: {
		localizedImage: {
			language: string
			media_type: string
			url: string
		}[]
	}
}

interface ServiceAlertResponse {
	alert: ServiceAlertExtended
	id: string
}

async function parseServiceAlert(alert: Alert, lines: Line[]): Promise<ServiceAlertResponse> {
	const informed_entity = (): EntitySelector[] => {
		const informed_entity: EntitySelector[] = [];

		switch (alert.reference_type) {
			case 'AGENCY':
				alert.references.forEach((reference) => {
					informed_entity.push({
						agency_id: reference.parent_id,
					});
				});
				break;
			case 'LINE':
				alert.references.forEach((reference) => {
					const line = lines.find(line => line.id === reference.parent_id);
					for (const route_id of line?.route_ids ?? []) {
						if (reference.child_ids.length === 0) {
							const entity = {
								route_id: route_id,
							};
							informed_entity.push(entity);
						}
						else {
							reference.child_ids.forEach((child_id) => {
								const entity = {
									route_id: route_id,
									stop_id: child_id,
								};
								informed_entity.push(entity);
							});
						}
					}
				});
				break;
			case 'STOP':
				alert.references.forEach((reference) => {
					if (reference.child_ids.length === 0) {
						informed_entity.push({
							route_id: reference.parent_id,
							stop_id: reference.parent_id,
						});
					}
					else {
						reference.child_ids.forEach((child_id) => {
							informed_entity.push({
								route_id: child_id,
								stop_id: reference.parent_id,
							});
						});
					}
				});
				break;
		}

		return informed_entity;
	};

	const file = await files.findById(alert.file_id);
	let fileUrl = '';
	try {
		fileUrl = await files.getFileUrl({ file_id: alert.file_id });
	}
	catch (error) {
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
			image: file && {
				localizedImage: [
					{
						language: 'pt-PT',
						media_type: file.type ?? 'image/png',
						url: fileUrl,
					},
				],
			},
			informed_entity: informed_entity(),
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
