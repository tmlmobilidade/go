/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Populates a template object with data from another object.
 * @param template The template object to be populated.
 * @param data The data object to populate the template with.
 * @returns The populated template object.
 */
export default function fillTemplate<T>(template: T, data: any): T {
	//

	// Return the template if there is no data
	if (!data) return template;

	// Create a deep copy of the template object
	const populatedTemplateObject = JSON.parse(JSON.stringify(template));

	// Setup a recursive function to populate the template
	const recursivePopulate = (currentTemplateStep, currentDataStep) => {
		//

		// If the template is an object and not null
		if (typeof currentTemplateStep === 'object' && currentTemplateStep !== null) {
			//

			// If the template is an array and the data is also an array, populate each element recursively
			if (Array.isArray(currentTemplateStep) && Array.isArray(currentDataStep)) {
				return currentDataStep?.map(item => recursivePopulate(currentTemplateStep, item));
			}

			// If the data is also an object, recursively populate its properties
			if (typeof currentDataStep === 'object') {
				const populatedInnerObject = {};
				for (const key in currentTemplateStep) {
					populatedInnerObject[key] = recursivePopulate(currentTemplateStep[key], currentDataStep[key]);
				}
				return populatedInnerObject;
			}

			// If the data is null then use the template value
			if (currentDataStep === null || currentDataStep === undefined) {
				return currentTemplateStep;
			}

			// If it is something else use the data
			return currentDataStep;

			//
		}

		// If the template is not an object (i.e. an object or array) but data is null, use the template value
		if (currentDataStep === null || currentDataStep === undefined) {
			return currentTemplateStep;
		}

		// If the template is not an object and the data is defined, then use the data
		return currentDataStep;

		//
	};

	// Initiate the recursive dance
	return recursivePopulate(populatedTemplateObject, data);

	//
}
