/* * */

import { type AnalysisData } from '@/types/analysis-data.type.js';
import { type RideAnalysis } from '@tmlmobilidade/types';

/* * */

interface ExplicitRideAnalysis extends RideAnalysis {
	_id: 'TRANSACTION_SEQUENTIALITY'
	reason: 'ALL_TRANSACTIONS_RECEIVED_SO_FAR' | 'MISSING_TRANSACTIONS'
};

/**
 * This analyzer tests if there are any missing Transactions for the given Ride.
 *
 * GRADES:
 * → PASS = There are no gaps in the sequence of Transactions.
 * → FAIL = At least one Transaction is missing.
 */
export function transactionSequentialityAnalyzer(analysisData: AnalysisData): ExplicitRideAnalysis {
	try {
		//

		// 1.
		// Organize transactions by their SAM Serial Number

		const transactionsBySamSerialNumber = new Map<number, number[]>();

		for (const transaction of analysisData.simplified_apex_locations) {
			if (transaction.mac_sam_serial_number) {
				// Check if the transaction is already in the map
				if (!transactionsBySamSerialNumber.has(transaction.mac_sam_serial_number)) {
					// If not, create a new array for this SAM Serial Number
					transactionsBySamSerialNumber.set(transaction.mac_sam_serial_number, []);
				}
				// Add the ASE Counter Value to the array for this SAM Serial Number
				transactionsBySamSerialNumber.get(transaction.mac_sam_serial_number)?.push(transaction.mac_ase_counter_value);
			}
		}

		for (const transaction of analysisData.simplified_apex_on_board_refunds) {
			if (transaction.mac_sam_serial_number) {
				// Check if the transaction is already in the map
				if (!transactionsBySamSerialNumber.has(transaction.mac_sam_serial_number)) {
					// If not, create a new array for this SAM Serial Number
					transactionsBySamSerialNumber.set(transaction.mac_sam_serial_number, []);
				}
				// Add the ASE Counter Value to the array for this SAM Serial Number
				transactionsBySamSerialNumber.get(transaction.mac_sam_serial_number)?.push(transaction.mac_ase_counter_value);
			}
		}

		for (const transaction of analysisData.simplified_apex_on_board_sales) {
			if (transaction.mac_sam_serial_number) {
				// Check if the transaction is already in the map
				if (!transactionsBySamSerialNumber.has(transaction.mac_sam_serial_number)) {
					// If not, create a new array for this SAM Serial Number
					transactionsBySamSerialNumber.set(transaction.mac_sam_serial_number, []);
				}
				// Add the ASE Counter Value to the array for this SAM Serial Number
				transactionsBySamSerialNumber.get(transaction.mac_sam_serial_number)?.push(transaction.mac_ase_counter_value);
			}
		}

		for (const transaction of analysisData.simplified_apex_validations) {
			if (transaction.mac_sam_serial_number) {
				// Check if the transaction is already in the map
				if (!transactionsBySamSerialNumber.has(transaction.mac_sam_serial_number)) {
					// If not, create a new array for this SAM Serial Number
					transactionsBySamSerialNumber.set(transaction.mac_sam_serial_number, []);
				}
				// Add the ASE Counter Value to the array for this SAM Serial Number
				transactionsBySamSerialNumber.get(transaction.mac_sam_serial_number)?.push(transaction.mac_ase_counter_value);
			}
		}

		// console.log('transactionsBySamSerialNumber', transactionsBySamSerialNumber);

		// 2.
		// With the transactions organized by their SAM Serial Number,
		// we can now check if there are any gaps in the sequence of Transactions.

		const missingTransactions = new Map<number, number[]>();

		for (const [samSerialNumber, aseCounterValues] of transactionsBySamSerialNumber.entries()) {
			// Sort the ASE Counter Values in ascending order
			aseCounterValues.sort((a, b) => a - b);
			// Check for gaps in the sequence
			const gaps = [];
			for (let i = 0; i < aseCounterValues.length - 1; i++) {
				const currentValue = aseCounterValues[i];
				const nextValue = aseCounterValues[i + 1];
				// If the difference between the current and next value is greater than 1, there is a gap
				if (nextValue - currentValue > 1) {
					// Add the missing values to the gaps array
					for (let j = currentValue + 1; j < nextValue; j++) {
						gaps.push(j);
					}
				}
			}
			// If there are gaps, add them to the missingTransactions map
			if (gaps.length > 0) missingTransactions.set(samSerialNumber, gaps);
		}
		// console.log('missingTransactions', missingTransactions);

		// process.exit(0);

		// return {
		// 	_id: 'TRANSACTION_SEQUENTIALITY',
		// 	grade: 'pass',
		// 	message: `Found ${locationTransactionsStopIds.size} Location Transactions for ${pathStopIds.size} Stop IDs.`,
		// 	reason: 'ALL_STOPS_HAVE_LOCATION_TRANSACTIONS',
		// 	unit: null,
		// 	value: null,
		// };

		//
	}
	catch (error) {
		return {
			_id: 'TRANSACTION_SEQUENTIALITY',
			grade: 'error',
			message: error.message,
			reason: null,
			unit: null,
			value: null,
		};
	}
};
