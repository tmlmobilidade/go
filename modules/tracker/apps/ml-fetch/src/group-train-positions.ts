/* * */

import { DESTINATION_MAP, type TempoEsperaRawItem } from '@tmlmobilidade/external/dist/clients/ml/types.js';
import { Logger } from '@tmlmobilidade/logger';

import { type TrainPositionsMap } from './types.js';

/**
 * Groups platform waiting-time items by train, keeping the earliest next-stop arrival per train.
 */
export function groupTrainPositions({ items, trainPositionsMap }: { items: TempoEsperaRawItem[], trainPositionsMap: TrainPositionsMap }): void {
	for (const item of items) {
		if (!item.comboio || item.tempoChegada1 === '--') continue;

		const destinationCode = DESTINATION_MAP[item.destino as unknown as keyof typeof DESTINATION_MAP]?.code;
		if (!destinationCode) {
			Logger.debug({ message: `[groupTrainPositions] Unknown destino "${item.destino}" for train ${item.comboio} (stop_id: ${item.stop_id}), skipping` });
			continue;
		}

		const arrivalSeconds = Number.parseInt(item.tempoChegada1);
		if (Number.isNaN(arrivalSeconds)) {
			Logger.debug({ message: `[groupTrainPositions] Invalid arrival for train ${item.comboio}: "${item.tempoChegada1}"` });
			continue;
		}

		const existing = trainPositionsMap.get(item.comboio);
		if (!existing) {
			trainPositionsMap.set(item.comboio, {
				destination_id: destinationCode,
				next_stop: { arrival_seconds: arrivalSeconds, stop_id: item.stop_id },
			});
		} else if (arrivalSeconds < existing.next_stop.arrival_seconds) {
			trainPositionsMap.set(item.comboio, {
				destination_id: destinationCode,
				next_stop: { arrival_seconds: arrivalSeconds, stop_id: item.stop_id },
			});
		}
	}
}
