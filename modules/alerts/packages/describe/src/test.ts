/* * */

import { alertI18nTemplateCauses } from '@/templates/causes.js';
import { alertI18nTemplateEffects } from '@/templates/effects.js';
import { type I18nCodes } from '@/types.js';
import { type Alert } from '@tmlmobilidade/types';

import { alertI18nTemplateReferences } from './templates/references.js';

/* * */

export interface DescribeAlertProps {
	alert_type: Alert['type']
	cause: Alert['cause']
	effect: Alert['effect']
	reference_type: Alert['reference_type']
	references: Alert['references']
}

export interface DescribeAlertReturnType {
	description: Record<I18nCodes, string>
	title: Record<I18nCodes, string>
}

/* * */

export async function describeAlert(props: DescribeAlertProps): Promise<DescribeAlertReturnType | undefined> {
	//

	if (!props.cause || !props.effect || !props.reference_type || !props.references) return;

	//
	// Setup initial variables

	const result = {
		description: { en: [], pt: [] },
		title: { en: [], pt: [] },
	};

	//
	// Detect if the alert is singular or plural based on the reference type

	const isPlural = props.references.length > 1;

	//
	// Prepare the replacements for the templates

	const primaryReferenceIds = props.references.map(ref => ref.parent_id);

	//
	// Extract 'cause' template strings

	result.title.en.push(alertI18nTemplateCauses[props.cause].title[isPlural ? 'plural' : 'singular'].en.text);
	result.title.pt.push(alertI18nTemplateCauses[props.cause].title[isPlural ? 'plural' : 'singular'].pt.text);

	result.description.en.push(alertI18nTemplateCauses[props.cause].description[isPlural ? 'plural' : 'singular'].en.text);
	result.description.pt.push(alertI18nTemplateCauses[props.cause].description[isPlural ? 'plural' : 'singular'].pt.text);
	//
	// Extract 'effect' template strings

	result.title.en.push(alertI18nTemplateEffects[props.effect].title[isPlural ? 'plural' : 'singular'].en.text);
	result.title.pt.push(alertI18nTemplateEffects[props.effect].title[isPlural ? 'plural' : 'singular'].pt.text);

	result.description.en.push(alertI18nTemplateEffects[props.effect].description[isPlural ? 'plural' : 'singular'].en.text);
	result.description.pt.push(alertI18nTemplateEffects[props.effect].description[isPlural ? 'plural' : 'singular'].pt.text);
	//
	// Extract 'references' template strings

	result.title.en.push(alertI18nTemplateReferences[props.reference_type][primaryReferenceIds.length > 1 ? 'multiple' : 'single'].title[isPlural ? 'plural' : 'singular'].en.text);
	result.title.pt.push(alertI18nTemplateReferences[props.reference_type][primaryReferenceIds.length > 1 ? 'multiple' : 'single'].title[isPlural ? 'plural' : 'singular'].pt.text);

	result.description.en.push(alertI18nTemplateReferences[props.reference_type][primaryReferenceIds.length > 1 ? 'multiple' : 'single'].description[isPlural ? 'plural' : 'singular'].en.text);
	result.description.pt.push(alertI18nTemplateReferences[props.reference_type][primaryReferenceIds.length > 1 ? 'multiple' : 'single'].description[isPlural ? 'plural' : 'singular'].pt.text);
	//
	// Return the result

	return {
		description: {
			en: result.description.en.join(' '),
			pt: result.description.pt.join(' '),
		},
		title: {
			en: result.title.en.join(' '),
			pt: result.title.pt.join(' '),
		},
	};

	//
}
