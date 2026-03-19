/* * */

/**
 * Rides Change Stream Manager
 *
 * This module implements a singleton pattern for MongoDB change streams with in-memory pub/sub:
 *
 * Architecture:
 * ```
 * MongoDB Change Stream (1 singleton)
 *         ↓
 *  EventEmitter pub/sub
 *         ↓
 *   WebSocket clients
 * ```
 *
 * Instead of creating a MongoDB change stream per WebSocket connection (inefficient),
 * this creates a single change stream that publishes to an in-memory EventEmitter.
 * Multiple WebSocket clients can subscribe/unsubscribe to receive real-time updates.
 *
 * Benefits:
 * - Single MongoDB change stream regardless of number of clients
 * - Lazy initialization - stream only starts when first client connects through "asyncSingletonProxy"
 * - Clean subscription management per client
 * - Reduced database load and network overhead
*/

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { rides } from '@tmlmobilidade/interfaces';
import { normalizeRide } from '@tmlmobilidade/normalizers';
import { RideNormalized } from '@tmlmobilidade/types';
import { asyncSingletonProxy, HttpResponse } from '@tmlmobilidade/utils';
import EventEmitter from 'events';

/**
 * A listener function for ride changes.
 * Receives normalized ride data wrapped in an HTTP response format.
 */
export type RideChangeListener = (message: HttpResponse<RideNormalized>) => void;

/**
 * Singleton manager for MongoDB change streams with pub/sub capabilities.
 *
 * This class creates a single MongoDB change stream that watches for ride updates
 * and broadcasts them to multiple subscribers using an in-memory EventEmitter.
 *
 * The singleton pattern ensures only one change stream is active, regardless of
 * how many WebSocket clients are connected.
 */
class RidesChangeStreamManager {
	//

	private static instance: null | RidesChangeStreamManager = null;
	/**
	* In-memory pub/sub event emitter. (@see https://nodejs.org/api/events.html#class-eventemitter)
	*
	* This EventEmitter acts as the pub/sub broker between the MongoDB change stream
	* and WebSocket clients:
	* - The MongoDB change stream publishes to this emitter when rides change
	* - WebSocket clients subscribe to this emitter to receive updates
	* - When unsubscribing, clients are removed from the emitter's listener list
	*
	* Setting maxListeners to 0 allows unlimited subscribers without warnings,
	* which is necessary since we may have many concurrent WebSocket connections.
	*/
	private emitter = new EventEmitter();
	private initialized = false;

	/**
	 * Private constructor enforces singleton pattern.
	 * Use `getInstance()` to access the instance.
	 */
	private constructor() {
		this.emitter.setMaxListeners(0); // Allow unlimited listeners
	}

	static async getInstance(): Promise<RidesChangeStreamManager> {
		if (!RidesChangeStreamManager.instance) {
			RidesChangeStreamManager.instance = new RidesChangeStreamManager();
			await RidesChangeStreamManager.instance.init();
		}
		return RidesChangeStreamManager.instance;
	}

	subscribe(listener: RideChangeListener): void {
		this.emitter.on('change', listener);
	}

	unsubscribe(listener: RideChangeListener): void {
		this.emitter.off('change', listener);
	}

	/**
	 * Initializes the MongoDB change stream.
	 *
	 * This is called once during getInstance() to set up the change stream.
	 * The stream watches all operations on the rides collection and publishes
	 * changes to the EventEmitter.
	 *
	 * Flow:
	 * 1. MongoDB detects a change → 2. Change stream emits 'change' event →
	 * 3. Normalizes the ride data → 4. Publishes to EventEmitter →
	 * 5. All subscribed listeners receive the update
	 */
	private async init() {
		if (this.initialized) return;

		const ridesCollection = await rides.getCollection();

		// Watch all operations with full document updates
		ridesCollection
			.watch([], { fullDocument: 'updateLookup' })
			.on('change', (databaseOperation) => {
				if (typeof databaseOperation['fullDocument'] === 'undefined') {
					console.log('Undefined document:', databaseOperation);
					return;
				}
				const normalizedRide = normalizeRide(databaseOperation['fullDocument']);
				const message: HttpResponse<RideNormalized> = {
					data: normalizedRide,
					error: null,
					statusCode: HTTP_STATUS.OK,
				};
				// Publish to all subscribers via EventEmitter
				this.emitter.emit('change', message);
			});

		this.initialized = true;
	}

	//
}

export const ridesChangeStream = asyncSingletonProxy<RidesChangeStreamManager>(RidesChangeStreamManager);
