/* * */

import { DESTINATION_MAP, type TempoEsperaRawItem } from '@tmlmobilidade/external/dist/clients/ml/types.js';

import { type TrainPositionsMap } from './types.js';

/**
 * Groups platform waiting-time items by train, keeping the earliest next-stop arrival per train.
 */
export function groupTrainPositions({ items, trainPositionsMap }: { items: TempoEsperaRawItem[], trainPositionsMap: TrainPositionsMap }): void {
	for (const item of items) {
		if (!item.comboio || item.tempoChegada1 === '--') continue;

		const trainId = item.comboio;
		const destinationId = DESTINATION_MAP[item.destino as unknown as keyof typeof DESTINATION_MAP]?.code;
		const arrivalSeconds = Number.parseInt(item.tempoChegada1);
		const stopId = item.stop_id;

		if (!trainPositionsMap.has(trainId)) {
			trainPositionsMap.set(trainId, { destination_id: destinationId, next_stop: { arrival_seconds: arrivalSeconds, stop_id: stopId } });
		}

		if (arrivalSeconds < trainPositionsMap.get(trainId)!.next_stop.arrival_seconds) {
			trainPositionsMap.get(trainId)!.next_stop = { arrival_seconds: arrivalSeconds, stop_id: stopId };
		}
	}
}
