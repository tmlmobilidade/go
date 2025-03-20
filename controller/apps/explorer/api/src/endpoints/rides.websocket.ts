/* * */

import authorizationMiddleware from '@/middleware/authorization.middleware.js';
import LOGGER from '@helperkits/logger';
import { rides } from '@tmlmobilidade/core/interfaces';
import { Permissions } from '@tmlmobilidade/core/lib';
import { type Ride } from '@tmlmobilidade/core/types';
import { getUnixTimestamp } from '@tmlmobilidade/core/utils';
import { type RidesExplorerWebSocketMessage, type RidesExplorerWebSocketMessageConfig } from '@tmlmobilidade/sae-controller-pckg-utils';
import { WebSocket } from 'ws';

/* * */

export const ridesWebsocket = async function (fastify) {
	fastify.get('/rides', {
		preHandler: authorizationMiddleware<Ride>(
			Permissions.rides.scope,
			Permissions.rides.actions.list,
		),
		websocket: true,
	}, (socket: WebSocket) => {
		socket.on('message', async (message) => {
			//

			//
			// Before any specific action, try to decode and validate the message.
			// Messages are expected to be JSON strings with a specific structure.

			const messageString = message.toString();
			const messageData: RidesExplorerWebSocketMessage = JSON.parse(messageString);

			//
			// Connect to and prepare Rides database collection.

			const ridesCollection = await rides.getCollection();

			//
			// Handle a 'config' event. This signals either a new client connection
			// or a change in the operational date. Either way, there is the need to send
			// the full dataset for the given operational date, as well as start/update
			// the watch service for the database.

			if (messageData.action === 'config') {
				//

				//
				// Count all rides in the database for the requested operational date,
				// and send that value to the client.

				LOGGER.info(`[config] [1.1] Counting total items found for ${messageData.operational_date}...`);

				const totalItemsFound = await ridesCollection.countDocuments({ operational_date: messageData.operational_date });

				const totalItemsFoundResponse: RidesExplorerWebSocketMessage<RidesExplorerWebSocketMessageConfig> = {
					action: 'config',
					data: {
						total_items: totalItemsFound,
					},
					operational_date: messageData.operational_date,
					sender: 'server',
					timestamp: getUnixTimestamp(),
				};

				socket.send(JSON.stringify(totalItemsFoundResponse));

				LOGGER.info(`[config] [1.2] Found ${totalItemsFound} items for ${messageData.operational_date}.`);

				//
				// Start the database watch service.

				LOGGER.info('[config] [2.1] Initiating watch service...');

				ridesCollection
					.watch([], { fullDocument: 'updateLookup' })
					.on('change', async (databaseOperation) => {
						if (typeof databaseOperation['fullDocument'] === 'undefined') {
							console.log('Undefined document:', databaseOperation);
							return;
						}
						const rideData: Ride = databaseOperation['fullDocument'];
						const message: RidesExplorerWebSocketMessage<Ride> = {
							action: 'data',
							data: rideData,
							operational_date: rideData.operational_date,
							sender: 'server',
							timestamp: getUnixTimestamp(),
						};
						socket.send(JSON.stringify(message));
					});

				LOGGER.info('[config] [2.2] Watch service started.');

				//
				// Then, send the full dataset for the given operational date.

				LOGGER.info('[config] [3.1] Preparing full dataset...');

				const allRidesData = ridesCollection
					.find({ operational_date: messageData.operational_date })
					.stream();

				for await (const rideData of allRidesData) {
					const message: RidesExplorerWebSocketMessage<Ride> = {
						action: 'data',
						data: rideData,
						operational_date: rideData.operational_date,
						sender: 'server',
						timestamp: getUnixTimestamp(),
					};
					socket.send(JSON.stringify(message));
				}

				LOGGER.info('[config] [3.2] Full dataset sent.');

				//
			}

			//
		});
	});
};
