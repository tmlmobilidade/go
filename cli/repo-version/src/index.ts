#!/usr/bin/env node

/* * */

import { Dates } from '@tmlmobilidade/dates';
import fs from 'node:fs';

/* * */

await (async function init() {
	//

	//
	// Parse command-line arguments

	const args = process.argv.slice(2);

	const prefixArg = args.find(arg => arg.startsWith('--prefix='));
	const prefix = prefixArg ? prefixArg.split('=')[1] : '';

	const suffixArg = args.find(arg => arg.startsWith('--suffix='));
	const suffix = suffixArg ? suffixArg.split('=')[1] : '';

	const formatArg = args.find(arg => arg.startsWith('--format='));
	const format = formatArg ? formatArg.split('=')[1] : '';

	const limitArg = args.find(arg => arg.startsWith('--limit='));
	const limit = limitArg ? limitArg.split('=')[1] : '';

	const outputArg = args.find(arg => arg.startsWith('--output='));
	const output = outputArg ? outputArg.split('=')[1] : '';

	//
	// Generate the new version based on the current date and time

	const dateValue = Dates.now('Europe/Lisbon');

	let futurePackageVersion = '';

	//
	// Format the version string.
	// For "default" format: [prefix]YYYYMMDD.HHMM.SS
	// For "code" format: YYYYMMDDHHMMSS (as a single number, no prefix)

	if (!format || format === 'default') {
		futurePackageVersion = `${prefix}${dateValue.toFormat('yyyyMMdd.HHmm.ss')}${suffix}`;
	}

	if (format === 'code') {
		futurePackageVersion = String(Number(dateValue.toFormat('yyyyMMddHHmmss')));
	}

	//
	// Check if the version exceeds the limit, if provided.
	// Cut the version string if it exceeds the limit.

	if (limit && Number(limit) > 0) {
		futurePackageVersion = futurePackageVersion.slice(0, Number(limit));
	}

	//
	// If the ouput is set to "console",
	// just print the version to the console and exit.

	if (output === 'console') {
		console.log(futurePackageVersion);
		process.exit(0);
	}

	//
	// If there is a package.json path argument,
	// read the file and parse its content.

	if (!output) {
		console.error('✘ Error: No path to package.json provided.');
		process.exit(1);
	}

	const packageJsonFile = fs.readFileSync(output, 'utf8');
	const packageJsonData = JSON.parse(packageJsonFile);

	//
	// Update the package.json file with the new version
	// and log the change to the console.

	const currentPackageVersion = packageJsonData.version;

	packageJsonData.version = futurePackageVersion;

	fs.writeFileSync(output, JSON.stringify(packageJsonData, null, '\t'));

	console.log(`✓ Package Version updated from "${currentPackageVersion}" to "${futurePackageVersion}".`);

	//
}());
