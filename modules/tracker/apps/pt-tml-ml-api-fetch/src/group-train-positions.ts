/* * */

import { DESTINATION_MAP, type TempoEsperaRawItem } from '@tmlmobilidade/external/dist/clients/ml/types.js';

import { type TrainPositionsMap } from './types.js';

/**
 * Groups platform waiting-time items by train, keeping the earliest next-stop arrival per train.
 * Considers all three arrival slots (comboio / comboio2 / comboio3).
 */
export function groupTrainPositions({ items, trainPositionsMap }: { items: TempoEsperaRawItem[], trainPositionsMap: TrainPositionsMap }): void {
	for (const item of items) {
		const destinationId = DESTINATION_MAP[item.destino as unknown as keyof typeof DESTINATION_MAP]?.code;
		const trains = [
			{ comboio: item.comboio, tempo: item.tempoChegada1 },
			{ comboio: item.comboio2, tempo: item.tempoChegada2 },
			{ comboio: item.comboio3, tempo: item.tempoChegada3 },
		];

		for (const train of trains) {
			if (!train.comboio || train.tempo === '--') continue;

			const arrivalSeconds = Number.parseInt(String(train.tempo), 10);
			if (Number.isNaN(arrivalSeconds)) continue;

			const existing = trainPositionsMap.get(train.comboio);
			if (!existing) {
				trainPositionsMap.set(train.comboio, {
					destination_id: destinationId,
					next_stop: { arrival_seconds: arrivalSeconds, stop_id: item.stop_id },
				});
				continue;
			}

			if (arrivalSeconds < existing.next_stop.arrival_seconds) {
				existing.next_stop = { arrival_seconds: arrivalSeconds, stop_id: item.stop_id };
			}
		}
	}
}
