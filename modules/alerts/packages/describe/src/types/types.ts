/* * */

import { type TemplatePlaceholder } from '@/types/placeholders.js';
import { type Alert, type AlertCauseEffectPairs } from '@tmlmobilidade/types';

/**
 * Structure representing a string type with its text and associated placeholders.
 * Used for defining alert descriptions and titles in different languages.
 */
export interface StringType {
	placeholders: TemplatePlaceholder[]
	text: string
}

/**
 * Internationalization codes used for different
 * languages in alert descriptions and titles.
 */
export type I18nCodes = 'en' | 'pt';

/**
 * Structure representing a countable string type,
 * which can have both singular and plural forms.
 * Singular form is mandatory, while plural is optional.
 */
export interface CountableStringType {
	plural?: Record<I18nCodes, StringType>
	singular: Record<I18nCodes, StringType>
}

/**
 * Structure representing the template fragment for an alert,
 * including its description and title, each with countable string types.
 */
export interface TemplateFragment {
	description: CountableStringType
	title: CountableStringType
}

/**
 * Type representing the unique key for an alert configuration,
 * composed of its cause, effect, and reference type separated by colons.
 */
export type AlertConfigKey = `${AlertCauseEffectPairs}:${Alert['reference_type']}`;
