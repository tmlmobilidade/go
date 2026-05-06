/* * */

import { readFileSync } from 'node:fs';
import { NoRetryConfigurationDetails, Region, SimpleAuthenticationDetailsProvider } from 'oci-common';
import { GenerativeAiInferenceClient, requests } from 'oci-generativeaiinference';

/**
 * This is a simple wrapper around the OCI Generative AI SDK to make it easier
 * to use in our application. It currently only supports running a text prompt
 * through the "openai.gpt-oss-120b" model and getting a response.
 */
export class OCIGenerativeAIProvider {
	//

	private readonly modelOCID = 'ocid1.generativeaimodel.oc1.eu-frankfurt-1.amaaaaaask7dceyaz25iqdyw27r4kve6tu7mnbpviyllkgswzwkwstriguvq';
	private readonly ociClient: GenerativeAiInferenceClient;

	constructor() {
		// Validate that all required environment variables are set
		if (!process.env.OCI_FINGERPRINT) throw new Error('Missing OCI_FINGERPRINT environment variable for OCI Generative AI Provider');
		if (!process.env.OCI_PRIVATE_KEY_PATH && !process.env.OCI_PRIVATE_KEY) throw new Error('Missing OCI_PRIVATE_KEY_PATH or OCI_PRIVATE_KEY environment variable for OCI Generative AI Provider');
		if (!process.env.OCI_REGION) throw new Error('Missing OCI_REGION environment variable for OCI Generative AI Provider');
		if (!process.env.OCI_TENANCY) throw new Error('Missing OCI_TENANCY environment variable for OCI Generative AI Provider');
		if (!process.env.OCI_USER) throw new Error('Missing OCI_USER environment variable for OCI Generative AI Provider');
		if (!process.env.OCI_COMPARTMENT) throw new Error('Missing OCI_COMPARTMENT environment variable for OCI Generative AI Provider');
		// Build the OCI client using the environment variables for authentication
		this.ociClient = new GenerativeAiInferenceClient({
			authenticationDetailsProvider: new SimpleAuthenticationDetailsProvider(
				process.env.OCI_TENANCY,
				process.env.OCI_USER,
				process.env.OCI_FINGERPRINT,
				process.env.OCI_PRIVATE_KEY_PATH ? readFileSync(process.env.OCI_PRIVATE_KEY_PATH, 'utf8') : process.env.OCI_PRIVATE_KEY,
				null,
				Region.fromRegionId(process.env.OCI_REGION),
			),
		});
		this.ociClient.endpoint = `https://inference.generativeai.${process.env.OCI_REGION}.oci.oraclecloud.com`;
	}

	/**
	 * Runs a prompt through the OCI Generative AI service and returns the response.
	 * This is using the "openai.gpt-oss-120b" model, which is a 120B parameter model
	 * based on the open source Falcon-40B-Instruct-v2 architecture,
	 * but with more parameters and trained on more data.
	 * @param prompt The prompt to run through the model.
	 * @returns The response from the model.
	 */
	async run(prompt: string): Promise<string> {
		//

		//
		// Build the chat request, in the most complicated way possible
		// because the OCI SDK is a nightmare to work with.
		// (This was written by AI, I swear.)

		const chatRequest: requests.ChatRequest = {
			chatDetails: {
				chatRequest: {
					apiFormat: 'GENERIC',
					frequencyPenalty: 0,
					maxTokens: 2048,
					messages: [
						{
							content: [
								{
									// @ts-expect-error — OMG this has to be the most convoluted way to send
									// a simple text message I've ever seen in my life.
									text: prompt,
									type: 'TEXT',
								},
							],
							role: 'USER',
						},
					],
					presencePenalty: 0,
					temperature: 1,
					topK: 0,
					topP: 1,
				},
				compartmentId: process.env.OCI_COMPARTMENT,
				servingMode: {
					modelId: this.modelOCID,
					servingType: 'ON_DEMAND',
				},
			},
			retryConfiguration: NoRetryConfigurationDetails,
		};

		//
		// Send the chat request and return the response.
		// Again, this is the most convoluted way to get a simple text response from the model.

		const chatResponse = await this.ociClient.chat(chatRequest);

		if (!('chatResult' in chatResponse)) {
			throw new Error('Invalid response from OCI Generative AI service: ' + JSON.stringify(chatResponse));
		}

		if (!('choices' in chatResponse.chatResult.chatResponse)) {
			throw new Error('Invalid response from OCI Generative AI service: ' + JSON.stringify(chatResponse));
		}

		// @ts-expect-error — Yes, I know this is a nightmare to read,
		// but this is the documented way to get the text response from the model.
		return chatResponse.chatResult.chatResponse.choices[0].message.content[0].text;

		//
	}

	//
}
