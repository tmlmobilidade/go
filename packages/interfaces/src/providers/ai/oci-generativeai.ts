/* * */

import { readFileSync } from 'node:fs';
import { NoRetryConfigurationDetails, Region, SimpleAuthenticationDetailsProvider } from 'oci-common';
import { GenerativeAiInferenceClient, models, requests } from 'oci-generativeaiinference';

/* * */

export interface OCIGenerativeAIProviderConfiguration {
	compartment_ocid: string
	fingerprint: string
	namespace: string
	private_key?: string
	private_key_path?: string
	region: string
	tenancy: string
	user: string
}

/* * */

export class OCIGenerativeAIProvider {
	//

	private readonly config: OCIGenerativeAIProviderConfiguration;
	private readonly ociClient: GenerativeAiInferenceClient;

	constructor(config: OCIGenerativeAIProviderConfiguration) {
		this.config = config;
		this.ociClient = new GenerativeAiInferenceClient({
			authenticationDetailsProvider: new SimpleAuthenticationDetailsProvider(
				config.tenancy,
				config.user,
				config.fingerprint,
				config.private_key_path ? readFileSync(config.private_key_path, 'utf8') : config.private_key,
				null,
				Region.fromRegionId(config.region),
			),
		});
		this.ociClient.endpoint = `https://inference.generativeai.${config.region}.oci.oraclecloud.com`;
	}

	async run(prompt: string): Promise<string> {
		const servingMode: models.OnDemandServingMode = {
			modelId: 'ocid1.generativeaimodel.oc1.eu-frankfurt-1.amaaaaaask7dceyaz25iqdyw27r4kve6tu7mnbpviyllkgswzwkwstriguvq',
			servingType: 'ON_DEMAND',
		};
		// Chat Details
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
									// @ts-expect-error — The type definition is wrong, of course...
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
				compartmentId: this.config.compartment_ocid,
				servingMode: servingMode,
			},
			retryConfiguration: NoRetryConfigurationDetails,
		};

		const chatResponse = await this.ociClient.chat(chatRequest);
		console.log({ chatResponse });
		return 'text';
	}

	//
}
