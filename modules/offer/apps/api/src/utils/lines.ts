/* * */

import { fares, typologies } from '@tmlmobilidade/interfaces';
import { type Fare, type FareSimplified, type Line, type Typology, type TypologySimplified } from '@tmlmobilidade/types';

/* * */

function toTypologySimplified(typology: Typology): TypologySimplified {
	return {
		_id: typology._id,
		code: typology.code,
		color: typology.color,
		default_onboard_fare_ids: typology.default_onboard_fare_ids,
		default_prepaid_fare_id: typology.default_prepaid_fare_id,
		name: typology.name,
		text_color: typology.text_color,
	};
}

function toFareSimplified(fare: Fare): FareSimplified {
	return {
		_id: fare._id,
		name: fare.name,
		payment_method: fare.payment_method,
	};
}

export async function populateLines(linesData: Line[]): Promise<Line[]> {
	if (!linesData.length) return linesData;

	const typologyIds = [...new Set(linesData.map(line => line.typology).filter(Boolean))] as string[];
	const fareIds = [...new Set([
		...linesData.map(line => line.prepaid_fare_id).filter(Boolean),
		...linesData.flatMap(line => line.onboard_fare_ids ?? []),
	])] as string[];

	const [typologiesData, faresData] = await Promise.all([
		typologyIds.length
			? typologies.findMany({ _id: { $in: typologyIds } })
			: Promise.resolve([]),
		fareIds.length
			? fares.findMany({ _id: { $in: fareIds } })
			: Promise.resolve([]),
	]);

	const typologyById = new Map(typologiesData.map(typology => [typology._id, typology]));
	const fareById = new Map(faresData.map(fare => [fare._id, fare]));

	return linesData.map((line) => {
		const typology = line.typology ? typologyById.get(line.typology) : undefined;
		const prepaidFare = line.prepaid_fare_id ? fareById.get(line.prepaid_fare_id) : undefined;
		const onboardFares = (line.onboard_fare_ids ?? [])
			.map(fareId => fareById.get(fareId))
			.filter((fare): fare is Fare => !!fare);

		return {
			...line,
			onboard_fares_data: onboardFares.map(toFareSimplified),
			prepaid_fare_data: prepaidFare ? toFareSimplified(prepaidFare) : null,
			typology_data: typology ? toTypologySimplified(typology) : null,
		};
	});
}

export async function populateLine(lineData: Line): Promise<Line> {
	const [populatedLine] = await populateLines([lineData]);
	return populatedLine;
}
