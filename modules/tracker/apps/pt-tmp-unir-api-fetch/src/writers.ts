/* * */

import { rawDb } from '@tmlmobilidade/go-interfaces-rawdb';
import { type RawVehicleEventPtTmpUnirUt1V1, type RawVehicleEventPtTmpUnirUt2V1, type RawVehicleEventPtTmpUnirUt3V1, type RawVehicleEventPtTmpUnirUt4V1, type RawVehicleEventPtTmpUnirUt5V1 } from '@tmlmobilidade/go-types-vehicle-events';
import { BatchWriter } from '@tmlmobilidade/utils';

/* * */

export const ut1Writer = new BatchWriter<RawVehicleEventPtTmpUnirUt1V1>({
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
		await rawDb.vehicleEvents.ptTmpUnirUt1.bulkWrite(writeOps);
	},
	title: 'rawdb|pt-tmp-unir-ut1',
});

export const ut2Writer = new BatchWriter<RawVehicleEventPtTmpUnirUt2V1>({
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
		await rawDb.vehicleEvents.ptTmpUnirUt2.bulkWrite(writeOps);
	},
	title: 'rawdb|pt-tmp-unir-ut2',
});

/* * */

export const ut3Writer = new BatchWriter<RawVehicleEventPtTmpUnirUt3V1>({
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
		await rawDb.vehicleEvents.ptTmpUnirUt3.bulkWrite(writeOps);
	},
	title: 'rawdb|pt-tmp-unir-ut3',
});

/* * */

export const ut4Writer = new BatchWriter<RawVehicleEventPtTmpUnirUt4V1>({
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
		await rawDb.vehicleEvents.ptTmpUnirUt4.bulkWrite(writeOps);
	},
	title: 'rawdb|pt-tmp-unir-ut4',
});

/* * */

export const ut5Writer = new BatchWriter<RawVehicleEventPtTmpUnirUt5V1>({
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
		await rawDb.vehicleEvents.ptTmpUnirUt5.bulkWrite(writeOps);
	},
	title: 'rawdb|pt-tmp-unir-ut5',
});
