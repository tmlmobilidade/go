// /* * */

// import { Dates } from '@tmlmobilidade/dates';
// import { getSimplifiedApexValidationCategory, validateIfSimplifiedApexOnBoardSaleIsPassenger, validateIfSimplifiedApexValidationIsPassenger } from '@tmlmobilidade/go-apex-pckg-parse';
// import { rides } from '@tmlmobilidade/interfaces';
// import { Logger } from '@tmlmobilidade/logger';
// import { Timer } from '@tmlmobilidade/timer';

// import { escapeClickHouseString, queryRows, updateById } from '@/utils/clickhouse.js';

// /* * */

// type SaleRow = {
// 	_id: string
// 	card_serial_number: string
// 	created_at: number
// };

// type ValidationRow = {
// 	_id: string
// 	event_type: number
// 	line_id: string
// 	on_board_refund_id: null | string
// 	pattern_id: string
// 	stop_id: string
// 	trip_id: string
// 	units_qty: null | number
// 	validation_status: number
// 	vehicle_id: number
// };

// /**
//  * This function links Sales with Validation transactions.
//  * This function should be run after the linkRefundsToSalesToValidations function,
//  * as it relies on the Sales already being linked to Refunds when they exist.
//  * The function looks for OnBoardSales that do not yet have a validation_id value,
//  * and then finds the corresponding Validation transaction by matching the CardSerialNumber.
//  * It updates each transaction with the relevant IDs and additional information.
//  */
// export async function linkSalesToValidations() {
// 	try {
// 		//

// 		Logger.init();
// 		Logger.info('Linking Sales to Validations...');

// 		const globalTimer = new Timer();

// 		let totalUnlinkedOnBoardSales = 0;
// 		let totalLinkedOnBoardSales = 0;

// 		//
// 		// Like Refunds, OnBoard Sales can be linked to Validations by matching
// 		// the unique CardSerialNumber. In this iteration, we hopefully will only
// 		// match the remaining transactions that were not linked in the previous iteration.

// 		const unlinkedOnBoardSales = await queryRows<SaleRow>(`
// 			SELECT _id, card_serial_number, created_at
// 			FROM simplified_apex_on_board_sales
// 			WHERE validation_id IS NULL
// 			ORDER BY created_at DESC
// 			LIMIT 200000
// 		`);

// 		for (const onBoardSale of unlinkedOnBoardSales) {
// 			totalUnlinkedOnBoardSales++;
// 			if (totalUnlinkedOnBoardSales % 10000 === 0) Logger.info(`Gone through ${totalUnlinkedOnBoardSales} OnBoardSales so far and linked ${totalLinkedOnBoardSales} of them to Validations.`);
// 			// Fetch the corresponding Validation transaction.
// 			// If no transaction is found, skip this iteration.
// 			const [validationTransaction] = await queryRows<ValidationRow>(`
// 				SELECT _id, event_type, line_id, on_board_refund_id, pattern_id, stop_id, trip_id, units_qty, validation_status, vehicle_id
// 				FROM simplified_apex_validations
// 				WHERE card_serial_number = '${escapeClickHouseString(onBoardSale.card_serial_number)}'
// 				ORDER BY created_at DESC
// 				LIMIT 1
// 			`);

// 			if (!validationTransaction) continue;
// 			// If a transaction was found, update both documents with
// 			// their corresponding IDs and additional information.
// 			await updateById('simplified_apex_validations', validationTransaction._id, {
// 				category: getSimplifiedApexValidationCategory(validationTransaction.units_qty, onBoardSale._id),
// 				is_passenger: validateIfSimplifiedApexValidationIsPassenger(validationTransaction.validation_status, validationTransaction.event_type, validationTransaction.on_board_refund_id),
// 				on_board_sale_id: onBoardSale._id,
// 			});
// 			//
// 			await updateById('simplified_apex_on_board_sales', onBoardSale._id, {
// 				is_passenger: validateIfSimplifiedApexOnBoardSaleIsPassenger(validationTransaction.on_board_refund_id),
// 				line_id: validationTransaction.line_id,
// 				pattern_id: validationTransaction.pattern_id,
// 				stop_id: validationTransaction.stop_id,
// 				trip_id: validationTransaction.trip_id,
// 				validation_id: validationTransaction._id,
// 				vehicle_id: validationTransaction.vehicle_id,
// 			});
// 			//
// 			const standardWindowInterval = Dates.fromUnixTimestamp(onBoardSale.created_at).std_window;
// 			await rides.updateMany(
// 				{
// 					start_time_scheduled: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
// 					trip_id: validationTransaction.trip_id,
// 				},
// 				{ system_status: 'waiting' },
// 				{ returnResults: false },
// 			);
// 			//
// 			totalLinkedOnBoardSales++;
// 			//
// 		}

// 		//

// 		Logger.success(`Linked ${totalLinkedOnBoardSales} out of ${totalUnlinkedOnBoardSales} OnBoardSales in ${globalTimer.get()}.`);

// 		//
// 	}
// 	catch (err) {
// 		console.log('An error occurred. Halting execution.', err);
// 		console.log('Retrying in 10 seconds...');
// 		setTimeout(() => process.exit(0), 10000); // after 10 seconds
// 	}
// };
