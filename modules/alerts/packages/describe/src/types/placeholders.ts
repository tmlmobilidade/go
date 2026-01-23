/**
 * List of all possible placeholders that can be used
 * in alert description and title templates.
 */
export type TemplatePlaceholder =
  | '*LINES*'
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
