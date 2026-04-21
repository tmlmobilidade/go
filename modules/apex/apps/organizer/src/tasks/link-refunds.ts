// /* * */

// import { escapeClickHouseString, queryRows, updateById } from '@/utils/clickhouse.js';
// import { Dates } from '@tmlmobilidade/dates';
// import { getSimplifiedApexValidationCategory, validateIfSimplifiedApexOnBoardSaleIsPassenger, validateIfSimplifiedApexValidationIsPassenger } from '@tmlmobilidade/go-apex-pckg-parse';
// import { rides } from '@tmlmobilidade/interfaces';
// import { Logger } from '@tmlmobilidade/logger';
// import { Timer } from '@tmlmobilidade/timer';

// /* * */

// interface RefundRow {
// 	_id: string
// 	card_serial_number: string
// 	created_at: number
// 	on_board_sale_id: null | string
// 	trip_id: null | string
// }

// interface SaleRow {
// 	_id: string
// }

// interface ValidationRow {
// 	_id: string
// 	event_type: number
// 	line_id: string
// 	pattern_id: string
// 	stop_id: string
// 	trip_id: string
// 	units_qty: null | number
// 	validation_status: number
// 	vehicle_id: number
// }

// /**
//  * This function links Refunds with Sales and Validation transactions.
//  * It first looks for OnBoardRefund trasactions that doe not yet have a validation_id value,
//  * and then finds the corresponding Validation transaction by matching the CardSerialNumber.
//  * It updates each transaction with the relevant IDs and additional information.
//  * APEX transactions are related to each other in the following way:
//  * - OnBoardRefunds already have the corresponding OnBoardSale ID.
//  * - OnBoardSales and Validations have a common and unique cardSerialNumber value.
//  */
// export async function linkRefundsToSalesToValidations() {
// 	try {
// 		//

// 		Logger.init();
// 		Logger.info('Linking Refunds to Sales and Validations...');

// 		const globalTimer = new Timer();

// 		let totalUnlinkedOnBoardRefunds = 0;
// 		let totalLinkedOnBoardRefunds = 0;

// 		//
// 		// Refunds are the smallest collection, and they already bring
// 		// the corresponding OnBoard Sale ID. They can be linked to Validations
// 		// by matching the CardSerialNumber. All sold on-board tickets have
// 		// a unique CardSerialNumber value that is present in the Validation transaction.

// 		const unlinkedOnBoardRefunds = await queryRows<RefundRow>(`
// 			SELECT _id, card_serial_number, created_at, on_board_sale_id, trip_id
// 			FROM simplified_apex_on_board_refunds
// 			WHERE validation_id IS NULL
// 			ORDER BY created_at DESC
// 		`);

// 		for (const onBoardRefund of unlinkedOnBoardRefunds) {
// 			totalUnlinkedOnBoardRefunds++;
// 			if (totalUnlinkedOnBoardRefunds % 10000 === 0) Logger.info(`Gone through ${totalUnlinkedOnBoardRefunds} Refunds so far and linked ${totalLinkedOnBoardRefunds} of them to Sales and Validations.`);
// 			// Fetch the corresponding Validation transaction.
// 			// If no transaction is found, skip this iteration.
// 			const [validationTransaction] = await queryRows<ValidationRow>(`
// 				SELECT _id, event_type, line_id, pattern_id, stop_id, trip_id, units_qty, validation_status, vehicle_id
// 				FROM simplified_apex_validations
// 				WHERE card_serial_number = '${escapeClickHouseString(onBoardRefund.card_serial_number)}'
// 				ORDER BY created_at DESC
// 				LIMIT 1
// 			`);
// 			if (!validationTransaction) continue;
// 			// Fetch the corresponding OnBoardSale transaction.
// 			// If no transaction is found, skip this iteration.
// 			if (!onBoardRefund.on_board_sale_id) continue;

// 			const [onBoardSaleTransaction] = await queryRows<SaleRow>(`
// 				SELECT _id
// 				FROM simplified_apex_on_board_sales
// 				WHERE _id = '${escapeClickHouseString(onBoardRefund.on_board_sale_id)}'
// 				LIMIT 1
// 			`);
// 			if (!onBoardSaleTransaction) continue;
// 			// If both transactions are found, update all three documents with
// 			// their corresponding IDs and additional information.
// 			await updateById('simplified_apex_validations', validationTransaction._id, {
// 				category: getSimplifiedApexValidationCategory(validationTransaction.units_qty, onBoardSaleTransaction._id),
// 				is_passenger: validateIfSimplifiedApexValidationIsPassenger(validationTransaction.validation_status, validationTransaction.event_type, onBoardRefund._id),
// 				on_board_refund_id: onBoardRefund._id,
// 				on_board_sale_id: onBoardSaleTransaction._id,
// 			});
// 			//
// 			await updateById('simplified_apex_on_board_sales', onBoardSaleTransaction._id, {
// 				is_passenger: validateIfSimplifiedApexOnBoardSaleIsPassenger(onBoardRefund._id),
// 				line_id: validationTransaction.line_id,
// 				on_board_refund_id: onBoardRefund._id,
// 				pattern_id: validationTransaction.pattern_id,
// 				stop_id: validationTransaction.stop_id,
// 				trip_id: validationTransaction.trip_id,
// 				validation_id: validationTransaction._id,
// 				vehicle_id: validationTransaction.vehicle_id,
// 			});
// 			//
// 			await updateById('simplified_apex_on_board_refunds', onBoardRefund._id, {
// 				line_id: validationTransaction.line_id,
// 				pattern_id: validationTransaction.pattern_id,
// 				stop_id: validationTransaction.stop_id,
// 				trip_id: validationTransaction.trip_id,
// 				validation_id: validationTransaction._id,
// 				vehicle_id: validationTransaction.vehicle_id,
// 			});
// 			//
// 			if (!validationTransaction.trip_id) continue;

// 			const standardWindowInterval = Dates.fromUnixTimestamp(onBoardRefund.created_at).std_window;
// 			await rides.updateMany(
// 				{
// 					start_time_scheduled: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
// 					trip_id: validationTransaction.trip_id,
// 				},
// 				{ system_status: 'waiting' },
// 				{ returnResults: false },
// 			);
// 			//
// 			totalLinkedOnBoardRefunds++;
// 			//
// 		}

// 		//

// 		Logger.success(`Linked ${totalLinkedOnBoardRefunds} out of ${totalUnlinkedOnBoardRefunds} OnBoardRefunds in ${globalTimer.get()}.`);

// 		//
// 	} catch (err) {
// 		console.log('An error occurred. Halting execution.', err);
// 		console.log('Retrying in 10 seconds...');
// 		setTimeout(() => process.exit(1), 10000); // after 10 seconds
// 	}
// };
