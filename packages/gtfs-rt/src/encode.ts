/* * */

import { initProto } from '@/init-proto.js';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/types';

/**
 * Encodes a GTFS-RT feed into an ArrayBuffer.
 * @param feedMessage The GTFS-RT feed as a JavaScript object.
 * @returns The encoded GTFS-RT feed as an ArrayBuffer.
 */
export async function encodeGtfsRtFeed(feedMessage: GtfsRtFeedMessage): Promise<Uint8Array<ArrayBufferLike>> {
	//

	//
	// Initialize the protobufjs root
	// with the GTFS-RT .proto file

	const protoRoot = await initProto();

	//
	// Encode the GTFS-RT feed using the protobufjs root

	const feedMessageType = protoRoot.lookupType('transit_realtime.FeedMessage');

	const message = feedMessageType.fromObject(feedMessage);

	return feedMessageType.encode(message).finish();

	//
}
