/* * */

import { makeLine, makePattern, makeRoute, makeStop, makeText } from '@/makeText.js';

/**
 * Library tts
 * Usage:
 * tts = require("@carrismetropolitana/tts");
 * tts.makeText()
 */

const tts = {
	makeLine, // same as makeStops - legacy alias
	makePattern, // Usage: tts.makePatterns('string' ) => Phonetic String
	makeRoute, // same as makeStops - legacy alias
	makeStop, // Usage: tts.makeStops('stopString', {transferModes}) => Phonetic String
	makeText, // same as makeStops - legacy alias
};

/* * */

export default tts;
