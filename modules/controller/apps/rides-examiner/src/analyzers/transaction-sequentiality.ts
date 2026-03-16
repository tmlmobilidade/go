/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { type Ride } from '@tmlmobilidade/types';

/**
 * This analyzer tests if there are any missing Transactions for the given Ride.
 *
 * GRADES:
 * → PASS = There are no gaps in the sequence of Transactions.
 * → FAIL = At least one Transaction is missing.
 */
export function transactionSequentialityAnalyzer(analysisData: AnalysisData): Ride['analysis']['TRANSACTION_SEQUENTIALITY'] {
	try {
		//

		//
		// Skip if no transactions found

		const apexLocationsQty = analysisData.simplified_apex_locations.length;
		const onBoardRefundsQty = analysisData.simplified_apex_on_board_refunds.length;
		const onBoardSalesQty = analysisData.simplified_apex_on_board_sales.length;
		const validationsQty = analysisData.simplified_apex_validations.length;

		if (!apexLocationsQty && !onBoardRefundsQty && !onBoardSalesQty && !validationsQty) {
			return {
				expected_qty: null,
				found_qty: null,
				grade: 'skip',
				missing_qty: null,
				reason: 'NO_TRANSACTIONS',
			};
		}

		//
		// Organize transactions by their SAM Serial Number

		const transactionsBySamSerialNumber = new Map<number, number[]>();

		for (const transaction of analysisData.simplified_apex_locations) {
			if (transaction.mac_sam_serial_number) {
				// Check if the SAM is already in the map
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
				// Skip if ASE Counter Value is invalid
				if (!transaction.mac_ase_counter_value) continue;
				// Check if the transaction is already in the map
				if (!transactionsBySamSerialNumber.has(transaction.mac_sam_serial_number)) {
					// If not, create a new array for this SAM Serial Number
					transactionsBySamSerialNumber.set(transaction.mac_sam_serial_number, []);
				}
				// Add the ASE Counter Value to the array for this SAM Serial Number
				transactionsBySamSerialNumber.get(transaction.mac_sam_serial_number)?.push(transaction.mac_ase_counter_value);
			}
		}

		//
		// With the transactions organized by their SAM Serial Number,
		// we can now check if there are any gaps in the sequence of Transactions.

		let expectedQty = 0;
		let foundQty = 0;
		let missingQty = 0;

		const missingTransactions = new Map<number, number[]>();

		for (const [samSerialNumber, aseCounterValues] of transactionsBySamSerialNumber.entries()) {
			// Sort the ASE Counter Values in ascending order
			aseCounterValues.sort((a, b) => a - b);
			// Add the expected and found quantities for this SAM Serial Number
			expectedQty += aseCounterValues[aseCounterValues.length - 1] - aseCounterValues[0] + 1;
			foundQty += aseCounterValues.length;
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
			missingQty += gaps.length;
		}

		if (missingTransactions.size === 0) {
			return {
				expected_qty: expectedQty,
				found_qty: foundQty,
				grade: 'pass',
				missing_qty: missingQty,
				reason: 'ALL_TRANSACTIONS_RECEIVED',
			};
		}

		return {
			expected_qty: expectedQty,
			found_qty: foundQty,
			grade: 'fail',
			missing_qty: missingQty,
			reason: 'MISSING_TRANSACTIONS',
		};

		//
	} catch (error) {
		return {
			error_message: error.message,
			expected_qty: null,
			found_qty: null,
			grade: 'error',
			missing_qty: null,
			reason: null,
		};
	}
};
