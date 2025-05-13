/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { apexT3, apexT11 } from '@tmlmobilidade/interfaces';

/* * */

export async function enrichApexT3() {
	try {
		//

		LOGGER.init();

		const globalTimer = new TIMETRACKER();

		//
		// Connect to databases

		const apexT3Collection = await apexT3.getCollection();
		const apexT11Collection = await apexT11.getCollection();

		//
		//
		//
		//

		const encomendas = {
			estado: 'AGUARDA_PAGAMENTO',
			id: 'encomenda-1',
			id_pagamento: 'pagamento-1',
			produtos: [],
		};

		const transacoesFinanceias = {
			encomenda_id: 'encomenda-1',
			estado: 'PAGO',
			id: 'pagamento-1',
			tipo: 'PAGAMENTO', // 'PAGAMENTO' | 'REEMBOLSO'
		};

		const reembolsos = {
			estado: 'REEMBOLSADO',
			id: 'pagamento-1',
		};

		//
		//
		//
		//
		//
		//

		const onBoardRefunds = {
			line_id: '3036',
			product_id: 'id-prod-navegante-metro',
			sale_id: '62BE90CE-0006-40AE-A960-C3B92C000003',
		};

		const onBoardSales = {
			is_refunded: true,
			line_id: '3036',
			product_id: 'id-prod-navegante-metro',
			sale_id: '62BE90CE-0006-40AE-A960-C3B92C000003',
			validation_id: '62BE90CE-0006-40AE-A960-C3B92C000003',
		};

		const validations = {
			line_id: '3036',
			product_id: 'id-prod-navegante-metro',
		};

		//
		//
		//
		//
		//
		//
		//
		//
		//

		const uhsdui = {
			actionListsVersion: '1.0',
			amountToDebit: null,
			apexTransactionType: 11,
			apexTransactionVersion: '2.0',
			apexVersion: '2.1.4',
			blockID: '',
			calendarID: 'id-calendar-no-restrictions',
			cardIssuer: 22,
			cardNetworkID: 'id-network-lisboa',
			cardNumber: 52483,
			cardPhysicalType: 3,
			cardSerialNumber: '00000000C38280FF',
			cardTypeID: 'id-cardtype-lisboaviva',
			channelID: 'id-channel-val',
			commercialOfferVersion: '1.0',
			contractNumber: 1,
			deviceID: 'berlioz_38000204',
			dutyID: '',
			eventType: 1,
			extraJourneyID: '',
			greylistItemsCount: 0,
			greylistItemsData: [],
			journeyID: '',
			lineLongID: '3036',
			mac: 'BJQ7RwAECQAHAQKuw7ksAAAD',
			networkID: 'id-network-lisboa',
			networkVersion: '1.0',
			operationPlanID: '',
			operatorLongID: '43',
			patternLongID: '3036_0_2',
			productLongID: 'id-prod-navegante-metro',
			productMatrixElementID: '',
			profilesUsedCount: 0,
			profilesUsedData: [],
			signedData: 'AQG/0I7oAAAAAAFYiIgBgABIBygAAQaAAAAACAAAAL/T13gAAAAAAViIiAEonEhZABASQgAAAAAAAAAAAQA+BwhIuKGGuAIVIhAkJX/2ABHgQgfBiIGd4UAAAAAAAJiAWAM0Di8LDkS8DLoDAIAAAAADYcgAAAAAAA==',
			spatialValidityLongID: 'c5190cb1-b5c9-4a3b-a518-9bb749aaa67e',
			stopLongID: '020132',
			technicalParametersVersion: '1.0',
			tickLoadDate: '2022-06-27',
			tickLoadMachCode: 1292,
			tickLoadNumbDaily: 215,
			transactionDate: '2022-07-01T07:14:38',
			transactionGroupId: '62BE90CE-0007-40AE-AF90-C3B92C000003',
			transactionId: '62BE90CE-0006-40AE-A960-C3B92C000003',
			unitsQuantity: null,
			unitsRemaining: 0,
			validationDataLongID: '',
			validationStatus: 0,
			validationType: 1,
			validatorID: 2848,
			validityPeriodID: '59676f19-4a98-4e02-be31-61f0d3181f78',
			vehicleID: 5001,
			vivaVersion: '1.56.0',
			whiteListItemID: '',
			zoneLongID: '43-1503',
		};

		//
		// For each document in the apexT3 collection,
		// get the corresponding document in the apexT11 collection
		// to enrich with additional data.

		//

		LOGGER.terminate(`Run took ${globalTimer.get()}.`);

		//
	}
	catch (err) {
		console.log('An error occurred. Halting execution.', err);
		console.log('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(0); // End process
		},
		10000); // after 10 seconds
	}

	//
};
