/* * */

import { type Environment, getCurrentEnvironment } from '@tmlmobilidade/types';

/**
 * This file contains a list of public variables
 * to be used in other applications from this repo.
 */
export const PUBLIC_VARIABLES = Object.freeze({
	go_api_url: {
		dev: 'https://go.tmlmobilidade.pt',
		prd: 'https://go.tmlmobilidade.pt',
		stg: 'https://go.tmlmobilidade.pt',
	},
	hub_api_url: {
		dev: 'http://localhost:52000',
		prd: 'http://localhost:52000/hub/api',
		stg: 'https://go.tmlmobilidade.pt/hub/api',
	},
	server_url_frontend: {
		dev: 'http://localhost:49002',
		prd: 'https://navegante.pt',
		stg: 'https://staging.navegante.pt',
	},
});

/**
 * Get values for a given public variable and environment.
 * @param key The variable key
 * @param environment The environment to get the URL for. If not provided, it will use the ENVIRONMENT environment variable.
 * @returns The variable value for the given key and environment
 */
export function getPublicVariable(key: keyof typeof PUBLIC_VARIABLES, environment?: Environment): string {
	// Get the desired variable object
	const variableObject = PUBLIC_VARIABLES[key];
	if (!variableObject) throw new Error(`Public Variable for key=${key} not found.`);
	// Extract the current app environment either from the parameter
	// or automatically from the set environment variable.
	const currentEnvironment = environment || getCurrentEnvironment();
	// Get the base URL for the current environment
	const variableValue = variableObject[currentEnvironment as keyof typeof variableObject];
	if (!variableValue) throw new Error(`Variable value for environment=${currentEnvironment} not found.`);
	// Return the value
	return variableValue;
}
