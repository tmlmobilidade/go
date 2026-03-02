/* * */

// NOTE: This is an approximate snapshot of GO v1 "Fare" documents.
// It exists only to provide a stable TypeScript shape for the seeding helpers.

const originalFare = {
	__v: 0,
	_id: '65c249f4b703558400a0f68a',
	code: 'T0-BORDO',
	createdAt: '2024-03-01T01:27:06.002Z',
	currency_type: 'EUR',
	is_locked: false,
	name: 'navegante® a bordo T0 (Grátis)',
	payment_method: '0',
	price: 0,
	short_name: 'T0-BORDO',
	transfers: '0',
	updatedAt: '2024-03-01T01:27:06.002Z',
};

/* * */

export type OriginalFareType = typeof originalFare;
