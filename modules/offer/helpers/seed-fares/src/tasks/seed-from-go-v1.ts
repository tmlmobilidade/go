/* * */

import { type OriginalFareType } from '@/original-fare.type.js';
import { Dates } from '@tmlmobilidade/dates';
import { fares } from '@tmlmobilidade/interfaces';
import { generateRandomString } from '@tmlmobilidade/strings';
import { type Fare, FARE_CURRENCY, FARE_PAYMENT_METHOD, FARE_TRANSFERS, FareSchema } from '@tmlmobilidade/types';

/* * */

export async function seedFromGoV1() {
	try {
		//

		//
		// Download and prepare GO fares data

		const originalFaresResponse = await fetch('https://go.carrismetropolitana.pt/api/fares');

		const originalFaresData = await originalFaresResponse.json() as OriginalFareType[];

		const now = Dates.now('Europe/Lisbon').unix_timestamp;
		let skipped = 0;
		const preparedFares = originalFaresData.map((originalFare) => {
			const parsed = FareSchema.safeParse({
				_id: generateRandomString(),
				agency_ids: ['41', '42', '43', '44'],
				code: normalizeCode(originalFare.code),
				created_at: now,
				created_by: 'system',
				currency_type: normalizeCurrencyType(originalFare.currency_type),
				is_locked: Boolean(originalFare.is_locked),
				name: normalizeName(originalFare.name),
				payment_method: normalizePaymentMethod(originalFare.payment_method),
				price: Number(originalFare.price || 0),
				transfers: normalizeTransfers(originalFare.transfers),
				updated_at: now,
				updated_by: 'system',
			});

			if (!parsed.success) {
				console.log('Skipping fare with validation error:', { code: originalFare.code, error: parsed.error.issues });
				skipped += 1;
				return null;
			}

			return parsed.data;
		}).filter(Boolean) as Fare[];

		console.log(`Prepared ${preparedFares.length} fares${skipped ? ` (skipped ${skipped})` : ''}`);

		//
		// Insert fares into DB

		await fares.insertMany(preparedFares, { unsafe: true });
		console.log(`Inserted ${preparedFares.length} fares`);

		//
	}
	catch (err) {
		console.error('Error importing fares:', err);
		process.exit(1);
	}
}

/* * */

function normalizeCode(value: unknown): string {
	const code = String(value ?? '').trim();
	return code.length > 10 ? code.slice(0, 10) : code;
}

function normalizeName(value: unknown): string {
	const name = String(value ?? '').trim();
	return name.length > 50 ? name.slice(0, 50) : name;
}

function normalizeCurrencyType(value: unknown): Fare['currency_type'] {
	const currency = String(value ?? '').trim().toUpperCase();
	if (currency === FARE_CURRENCY.EUR) return FARE_CURRENCY.EUR;
	return FARE_CURRENCY.EUR;
}

function normalizePaymentMethod(value: unknown): Fare['payment_method'] {
	const method = String(value ?? '').trim();
	if (method === FARE_PAYMENT_METHOD.ONBOARD || method === '0') return FARE_PAYMENT_METHOD.ONBOARD;
	if (method === FARE_PAYMENT_METHOD.PREPAID || method === '1') return FARE_PAYMENT_METHOD.PREPAID;
	return FARE_PAYMENT_METHOD.ONBOARD;
}

function normalizeTransfers(value: unknown): Fare['transfers'] {
	const transfers = String(value ?? '').trim();
	if (transfers === FARE_TRANSFERS.NONE || transfers === '0') return FARE_TRANSFERS.NONE;
	if (transfers === FARE_TRANSFERS.ONE || transfers === '1') return FARE_TRANSFERS.ONE;
	if (transfers === FARE_TRANSFERS.TWO || transfers === '2') return FARE_TRANSFERS.TWO;
	if (transfers === FARE_TRANSFERS.UNLIMITED || transfers === 'unlimited') return FARE_TRANSFERS.UNLIMITED;
	return FARE_TRANSFERS.NONE;
}
