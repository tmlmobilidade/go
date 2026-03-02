import { FARE_CURRENCY, FARE_PAYMENT_METHOD, FARE_TRANSFERS } from '@tmlmobilidade/types';

export const currencyOptions = [
	{ label: '€ Euro', value: FARE_CURRENCY.EUR },
];

export const paymentMethodsOptions = [
	{ label: 'Pagamento ao Motorista (navegante® a bordo)', value: FARE_PAYMENT_METHOD.ONBOARD },
	{ label: 'Pré-pagamento (navegante® pré-pago)', value: FARE_PAYMENT_METHOD.PREPAID },
];

export const transfersOptions = [
	{ label: 'Não são permitidos transbordos', value: FARE_TRANSFERS.NONE },
	{ label: 'Apenas é permitido 1 transbordo', value: FARE_TRANSFERS.ONE },
	{ label: 'São permitidos até 2 transbordos', value: FARE_TRANSFERS.TWO },
	{ label: 'Transbordos ilimitados', value: FARE_TRANSFERS.UNLIMITED },
];
