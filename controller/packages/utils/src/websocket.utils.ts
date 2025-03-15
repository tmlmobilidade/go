/* * */

import { type OperationalDate, type UnixTimestamp } from '@tmlmobilidade/core/types';

/* * */

/**
 * This interface represents the structure of a WebSocket
 * message sent by the Rides Explorer WebSocket.
 */
export interface RidesExplorerWebSocketMessage<T = never> {

	/**
	 * The action that the message is requesting.
	 * 'config' - Set the configuration for the expected dataset. This is used to change the active operational date.
	 * 'data' - Actual rides with their data.
	 * 'error' - An error ocurred.
	 */
	action: 'config' | 'data' | 'error'

	/**
	 * The actual data of the message.
	 */
	data?: T

	/**
	 * The active operational date for the rides.
	 */
	operational_date: OperationalDate

	/**
	 * The sender of the message.
	 * 'client' - The message was sent by the client.
	 * 'server' - The message was sent by the server.
	 */
	sender: 'client' | 'server'

	/**
	 * The timestamp of the message.
	 */
	timestamp: UnixTimestamp

}

export interface RidesExplorerWebSocketMessageConfig {
	total_items: number
}
