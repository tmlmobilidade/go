'use client';

/* * */

import { transformReferenceTypeAgency } from '@/reference-types/agency.js';
import { transformReferenceTypeLines } from '@/reference-types/lines.js';
import { transformReferenceTypeRides } from '@/reference-types/rides.js';
import { transformReferenceTypeStops } from '@/reference-types/stops.js';
import { Logger } from '@tmlmobilidade/logger';
import { type Alert } from '@tmlmobilidade/types';
import { type EntitySelector, type Alert as ServiceAlert } from 'gtfs-types';

/* * */

export async function transformAlert(alertData: Alert): Promise<ServiceAlert | undefined> {
	//

	//
	// Validate required input properties

	if (!alertData.reference_type || !alertData.references?.length) {
		Logger.error(`[Alert ID: ${alertData._id}] Alert reference_type or references are missing.`);
		return;
	}

	//
	// Request individual blocks

	let informedEntity: EntitySelector[] | undefined;

	if (alertData.reference_type === 'agency') {
		informedEntity = await transformReferenceTypeAgency(alertData);
		if (!informedEntity) return;
	}

	if (alertData.reference_type === 'lines') {
		informedEntity = await transformReferenceTypeLines(alertData);
		if (!informedEntity) return;
	}

	if (alertData.reference_type === 'rides') {
		informedEntity = await transformReferenceTypeRides(alertData);
		if (!informedEntity) return;
	}

	if (alertData.reference_type === 'stops') {
		informedEntity = await transformReferenceTypeStops(alertData);
		if (!informedEntity) return;
	}

	//
	// Validate required input properties

	return {
		alert: {
			active_period: [
				{
					end: alertData.active_period_end_date ? alertData.active_period_end_date / 1000 : undefined,
					start: alertData.active_period_start_date / 1000,
				},
			],
			cause: alertData.cause,
			coordinates: alertData.coordinates?.length === 2 ? [alertData.coordinates[0], alertData.coordinates[1]] : undefined,
			description_text: {
				translation: [
					{
						language: 'pt',
						text: alertData.description,
					},
				],
			},
			effect: alertData.effect,
			header_text: {
				translation: [
					{
						language: 'pt',
						text: alertData.title,
					},
				],
			},
			image: file ? {
				localizedImage: [
					{
						language: 'pt-PT',
						media_type: file.type ?? 'image/png',
						url: file.url ?? '',
					},
				],
			} : undefined,
			informed_entity: informed_entity(),
			url: {
				translation: [
					{
						language: 'pt-PT',
						text: alertData.info_url ?? '',
					},
				],
			},
		},
		id: alertData._id,
	};

	//
}
