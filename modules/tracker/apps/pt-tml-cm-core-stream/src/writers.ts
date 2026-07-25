/* * */

import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { type RawVehicleEventPtTmlCmAlsa, type RawVehicleEventPtTmlCmRl, type RawVehicleEventPtTmlCmTst, type RawVehicleEventPtTmlCmVa } from '@tmlmobilidade/go-types-vehicle-events';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

export const vaWriter = new BatchWriter<RawVehicleEventPtTmlCmVa>({
	batch_size: 500,
	batch_timeout: 500,
	idle_timeout: 500,
	insertFn: async (data) => {
		const writeOps = data.map(doc => ({
			updateOne: {
				filter: { _id: doc._id },
				update: { $set: doc },
				upsert: true,
			},
		}));
		await rawDb.vehicleEvents.ptTmlCmVa.bulkWrite(writeOps);
	},
	title: 'rawdb|pt-tml-cm-va',
});

export const rlWriter = new BatchWriter<RawVehicleEventPtTmlCmRl>({
	batch_size: 500,
	batch_timeout: 500,
	idle_timeout: 500,
	insertFn: async (data) => {
		const writeOps = data.map(doc => ({
			updateOne: {
				filter: { _id: doc._id },
				update: { $set: doc },
				upsert: true,
			},
		}));
		await rawDb.vehicleEvents.ptTmlCmRl.bulkWrite(writeOps);
	},
	title: 'rawdb|pt-tml-cm-rl',
});

/* * */

export const tstWriter = new BatchWriter<RawVehicleEventPtTmlCmTst>({
	batch_size: 500,
	batch_timeout: 500,
	idle_timeout: 500,
	insertFn: async (data) => {
		const writeOps = data.map(doc => ({
			updateOne: {
				filter: { _id: doc._id },
				update: { $set: doc },
				upsert: true,
			},
		}));
		await rawDb.vehicleEvents.ptTmlCmTst.bulkWrite(writeOps);
	},
	title: 'rawdb|pt-tml-cm-tst',
});

/* * */

export const alsaWriter = new BatchWriter<RawVehicleEventPtTmlCmAlsa>({
	batch_size: 500,
	batch_timeout: 500,
	idle_timeout: 500,
	insertFn: async (data) => {
		const writeOps = data.map(doc => ({
			updateOne: {
				filter: { _id: doc._id },
				update: { $set: doc },
				upsert: true,
			},
		}));
		await rawDb.vehicleEvents.ptTmlCmAlsa.bulkWrite(writeOps);
	},
	title: 'rawdb|pt-tml-cm-alsa',
});
