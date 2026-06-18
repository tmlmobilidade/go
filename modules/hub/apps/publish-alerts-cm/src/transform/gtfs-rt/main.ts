/* * */

import { transformCause } from '@/transform/gtfs-rt/cause-effect/cause.js';
import { transformEffect } from '@/transform/gtfs-rt/cause-effect/effect.js';
import { transformDescriptionText } from '@/transform/gtfs-rt/content/description-text.js';
import { transformHeaderText } from '@/transform/gtfs-rt/content/header-text.js';
import { transformImage } from '@/transform/gtfs-rt/content/image.js';
import { transformUrl } from '@/transform/gtfs-rt/content/url.js';
import { transformReferenceTypeAgency } from '@/transform/gtfs-rt/reference-types/agency.js';
import { transformReferenceTypeLines } from '@/transform/gtfs-rt/reference-types/lines.js';
import { transformReferenceTypeRides } from '@/transform/gtfs-rt/reference-types/rides.js';
import { transformReferenceTypeStops } from '@/transform/gtfs-rt/reference-types/stops.js';
import { Logger } from '@tmlmobilidade/logger';
import { type Alert, type GtfsRtEntitySelector, type GtfsRtFeedEntity } from '@tmlmobilidade/types';

/**
 * Transforms an Alert object into a GTFS-RT Feed Entity object.
 * This function validates the required properties of the input Alert object,
 * maps the cause and effect values to GTFS-RT standard values, transforms the
 * header and description texts, URL and image into GTFS-RT objects, and prepares
 * the informed_entity value based on the reference_type of the alert.
 * The output of this function still needs to be wrapped in a GTFS-RT FeedMessage object with
 * the appropriate header and any other feed entities before it can be served in a Protobuf feed.
 * @param alertData The Alert object to be transformed.
 * @returns A GTFS-RT Feed Entity object or undefined if the transformation fails.
 */
export async function transformAlertIntoGtfsRtEntity(alertData: Alert): Promise<GtfsRtFeedEntity | undefined> {
	try {
		//

		//
		// Validate required input properties

		if (!alertData.reference_type || !alertData.references?.length) {
			Logger.error({ message: `[Alert ID: ${alertData._id}] Alert reference_type or references are missing.` });
			return;
		}

		if (!alertData.active_period_start_date) {
			Logger.error({ message: `[Alert ID: ${alertData._id}] Alert active_period_start_date is missing.` });
			return;
		}

		//
		// Prepare the active_period value. GTFS-RT expects active_period to be
		// an array of objects with start and end properties in seconds since the epoch.

		const activePeriodValues = [{
			end: alertData.active_period_end_date ? alertData.active_period_end_date / 1_000 : undefined,
			start: alertData.active_period_start_date / 1_000,
		}];

		//
		// Prepare the cause and effect values as these need to be mapped
		// from the extended values back to the standard GTFS-RT values.

		const mappedCauseValue = transformCause(alertData);
		const mappedEffectValue = transformEffect(alertData);

		//
		// Prepare the Alert header and description texts,
		// URL and image values as GTFS-RT objects.

		const urlValue = transformUrl(alertData);
		const headerTextValue = transformHeaderText(alertData);
		const descriptionTextValue = transformDescriptionText(alertData);
		const imageValue = await transformImage(alertData);

		if (!headerTextValue) {
			Logger.error({ message: `[Alert ID: ${alertData._id}] Alert header_text is missing.` });
			return;
		}

		if (!descriptionTextValue) {
			Logger.error({ message: `[Alert ID: ${alertData._id}] Alert description_text is missing.` });
			return;
		}

		//
		// Prepare the informed_entity value
		// based on the reference_type

		let informedEntityValues: GtfsRtEntitySelector[] | undefined;

		if (alertData.reference_type === 'agency') {
			informedEntityValues = await transformReferenceTypeAgency(alertData);
		}

		if (alertData.reference_type === 'lines') {
			informedEntityValues = await transformReferenceTypeLines(alertData);
		}

		if (alertData.reference_type === 'rides') {
			informedEntityValues = await transformReferenceTypeRides(alertData);
		}

		if (alertData.reference_type === 'stops') {
			informedEntityValues = await transformReferenceTypeStops(alertData);
		}

		if (alertData.reference_type === 'stops') {
			informedEntityValues = await transformReferenceTypeStops(alertData);
		}

		if (!informedEntityValues) {
			Logger.error({ message: `[Alert ID: ${alertData._id}] Alert informed_entity values are missing.` });
			return;
		}

		//
		// Validate required input properties

		return {
			alert: {
				active_period: activePeriodValues,
				cause: mappedCauseValue,
				description_text: descriptionTextValue,
				effect: mappedEffectValue,
				header_text: headerTextValue,
				image: imageValue,
				informed_entity: informedEntityValues,
				url: urlValue,
			},
			id: alertData._id,
		};

		//
	} catch (error) {
		Logger.error({ message: `[Alert ID: ${alertData._id}] Error transforming alert: ${(error as Error).message}` });
	}
}
