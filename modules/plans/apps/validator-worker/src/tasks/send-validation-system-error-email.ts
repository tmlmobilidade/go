/* * */

import { SYSTEM_CONTACT_EMAIL } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { sendSystemErrorEmail } from '@tmlmobilidade/emails';
import { Logger } from '@tmlmobilidade/logger';
import pjson from 'pjson' with { type: 'json' };

/* * */

/** Notifies the system contact about a validation worker failure. */
export async function sendValidationSystemErrorEmail(error: unknown) {
	try {
		await sendSystemErrorEmail({
			data: {
				errorMessage: error instanceof Error ? error.message : String(error),
				serviceName: pjson.name,
				timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
			},
			to: SYSTEM_CONTACT_EMAIL,
		});
	} catch (emailError) {
		Logger.error({ error: emailError, message: 'Error sending validation system error email:' });
	}
}
