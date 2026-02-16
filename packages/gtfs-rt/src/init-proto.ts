/* * */

import fs from 'node:fs';
import path from 'node:path';
import protobufjs from 'protobufjs';

/* * */

const PROTO_SPEC_FILE_URL = 'https://gtfs.org/documentation/realtime/gtfs-realtime.proto';

const PROTO_SPEC_FILE_PATH = '/tmp/go-gtfs-rt/gtfs-realtime.proto';

/* * */

let PROTO_ROOT_INSTANCE: null | protobufjs.Root = null;

/**
 * Initializes the protobufjs Root by loading
 * the GTFS Realtime .proto definition file.
 * @returns The initialized protobufjs Root.
 */
export async function initProto(): Promise<protobufjs.Root> {
	//

	//
	// If the protobufjs Root has already been initialized,
	// return the existing instance to avoid redundant work.

	if (PROTO_ROOT_INSTANCE) return PROTO_ROOT_INSTANCE;

	//
	// Check if the .proto file already exists locally.
	// If not, download a fresh copy from the GTFS Realtime specification.

	if (!fs.existsSync(PROTO_SPEC_FILE_PATH)) {
		// Download the .proto definition file
		const response = await fetch(PROTO_SPEC_FILE_URL);
		const protoText = await response.text();
		// Get the directory of the path where the .proto file will be saved
		const dirPath = path.dirname(PROTO_SPEC_FILE_PATH);
		// Create the directory if it doesn't exist
		if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
		// Save the .proto file locally so it can be loaded by protobufjs
		fs.writeFileSync(PROTO_SPEC_FILE_PATH, protoText);
	}

	//
	// Load the .proto file using protobufjs,
	// save the initialized Root instance
	// in a global variable and return it.

	const protoRoot = new protobufjs.Root();

	PROTO_ROOT_INSTANCE = protoRoot.loadSync(PROTO_SPEC_FILE_PATH, { keepCase: true });

	return PROTO_ROOT_INSTANCE;

	//
}
