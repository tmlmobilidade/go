import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import { sendSucessfulGtfsValidationEmail, sendUnsuccessfulGtfsValidationEmail } from '@tmlmobilidade/emails';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type GtfsValidationOutputSummary } from '@tmlmobilidade/go-types-gtfs-validator';
import { type GtfsValidation } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/logger';

/** Sends the appropriate validation result email to the user who created the validation. */
export async function sendValidationResultEmail(gtfsValidation: GtfsValidation, summary: GtfsValidationOutputSummary) {
	try {
		const updatedGtfsValidation = await goDb.operation.gtfsValidations.findById(gtfsValidation._id);

		if (!updatedGtfsValidation) throw new Error(`GTFS Validation not found after update: ${gtfsValidation._id}`);
		if (!updatedGtfsValidation.created_by) throw new Error(`No creator information found for file: ${gtfsValidation.file_id}`);

		const foundUser = await goDb.core.users.findById(updatedGtfsValidation.created_by);
		if (!foundUser) throw new Error(`User not found: ${updatedGtfsValidation.created_by}`);

		if (updatedGtfsValidation.validity_status === 'valid') {
			await sendSucessfulGtfsValidationEmail({
				data: {
					firstName: foundUser.first_name,
					gtfsValidationId: gtfsValidation._id,
					gtfsValidationUrl: PAGE_ROUTES.plans.VALIDATIONS_DETAIL(gtfsValidation._id),
					totalWarnings: summary.total_warnings,
				},
				to: foundUser.email,
			});
		} else {
			await sendUnsuccessfulGtfsValidationEmail({
				data: {
					firstName: foundUser.first_name,
					gtfsValidationId: gtfsValidation._id,
					gtfsValidationUrl: PAGE_ROUTES.plans.VALIDATIONS_DETAIL(gtfsValidation._id),
					totalErrors: summary.total_errors,
					totalWarnings: summary.total_warnings,
				},
				to: foundUser.email,
			});
		}
	} catch (error) {
		Logger.error({ error, message: 'Error sending validation result email:' });
	}
}
