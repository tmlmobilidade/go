import { type LoggerMessage } from '../types/types.js';
import { formatMessage } from './format-message.js';
import { spacer } from './spacer.js';

export function progress(message: LoggerMessage, spacesAfter?: number, spacesBefore?: number): void {
	if (spacesBefore && spacesBefore > 0) spacer(spacesBefore);
	const formattedMessage = formatMessage(message);
	console.log(`• ${formattedMessage}`);
	if (spacesAfter && spacesAfter > 0) spacer(spacesAfter);
}
