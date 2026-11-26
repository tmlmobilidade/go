/* * */

import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

/** Generate the ZPHERES parameters file for one poster export. */
export function generateParametersJson(activeDate?: string): string {
	//

	//
	// A. Setup variables.

	if (!activeDate) throw new Error('Missing active date.');

	const date = activeDate.includes('.')
		? Dates.fromFormat(activeDate, 'dd.MM.yyyy', 'Europe/Lisbon')
		: Dates.fromOperationalDateInt(activeDate, 'Europe/Lisbon');

	//
	// B. Generate the parameters JSON.

	return `{

	"canvasId": "0Master.0",

	"dateParameters": [

	],

	"textParameters": [
		{
			"id": "Text.Validity.Date",
			"default": ${JSON.stringify(date.toFormat('dd.MM.yyyy'))}
		}
	]
}
`;
}
