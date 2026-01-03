/* * */

import { type Alert, type RideNormalized } from '@tmlmobilidade/types';

/**
 * List of all possible placeholders that can be used in alert description and title templates.
 */
export type TemplatePlaceholder =
  | '{headsign_title}'
  | '{holiday_name}'
  | '{line_short_name[]}'
  | '{line_short_name}'
  | '{lines_prose}'
  | '{lines_title}'
  | '{ride_description}'
  | '{ride_short_name[]}'
  | '{ride_short_name}'
  | '{rides_description}'
  | '{rides_title}'
  | '{start_time[]}'
  | '{start_time}'
  | '{stop_name[]}'
  | '{stop_name}'
  | '{stops_prose}'
  | '{stops_title}';

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
export type AlertConfigKey = `${Alert['cause']}:${Alert['effect']}:${Alert['reference_type']}`;

/* * */

export interface DescribeAlertProps {
	cause: Alert['cause']
	data: {
		lines?: { id: string, long_name: string, short_name: string }[]
		rides?: RideNormalized[]
		stops?: { id: string, name: string }[]
	}
	effect: Alert['effect']
	reference_type: Alert['reference_type']
	references: Alert['references']
}
