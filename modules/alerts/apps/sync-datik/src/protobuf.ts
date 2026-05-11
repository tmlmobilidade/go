/* * */

import { Logger } from '@tmlmobilidade/logger';
import path from 'path';
import protobufjs from 'protobufjs';

/* * */

/**
 * Fetches and decodes a protobuf message from a URL.
 * @param url - The URL to fetch the protobuf binary data from
 * @param protoPath - The file path to the .proto definition file
 * @param messageType - The fully qualified message type name (e.g., 'transit_realtime.FeedMessage')
 * @returns Promise resolving to the decoded protobuf message as the specified type, or null if an error occurs
 * @example
 * ```ts
 * const feedMessage = await fetchProtobuf<FeedMessage>(
 *   'https://api.example.com/data',
 *   './gtfs-realtime.proto',
 *   'transit_realtime.FeedMessage'
 * );
 * ```
 */
export async function fetchProtobuf<T>(
	url: string,
	protoPath: string,
	messageType: string,
): Promise<null | T> {
	try {
		// Load the proto definition
		const proto = new protobufjs.Root();
		const loadedProto = proto.loadSync(path.resolve(protoPath), { keepCase: true });
		const messageTypeObj = loadedProto.lookupType(messageType);

		// Fetch the protobuf binary data
		const response = await fetch(url);
		if (!response.ok) {
			Logger.error(`Failed to fetch protobuf data: HTTP ${response.status} - ${response.statusText}`);
			return null;
		}

		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Decode the protobuf message
		const message = messageTypeObj.decode(buffer);
		const decodedMessage = messageTypeObj.toObject(message, {
			arrays: true,
			bytes: String,
			defaults: true,
			enums: String,
			longs: String,
			objects: true,
			oneofs: true,
		}) as T;

		return decodedMessage;
	} catch (error) {
		Logger.error(`Error fetching protobuf from ${url}:`, error);
		return null;
	}
}
