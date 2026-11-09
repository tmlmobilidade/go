package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
)

/*
# Attributes

  - File: [stops.txt]
  - Field: [stop_desc, stop_name]
  - Presence: Optional, Conditionally Required
  - Type: Text

# Description

  - stop_desc: Useful additional description of the location, distinct from stop_name.
  - stop_name: Public-facing name of the location as shown on timetables or signs. For a boarding area, use its
    displayed designation. Translations belong in translations.txt.

Validation: Reports a non-empty stop_desc that exactly repeats stop_name. The comparison preserves whitespace and
letter case. Empty values are skipped; required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

Field definitions: [GTFS Standard].

[stops.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/stops
[GTFS Standard]: https://gtfs.org/documentation/schedule/reference/#stopstxt
*/
func StopDescDifferentStopName(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "stops", []string{"stop_desc", "stop_name"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "stop_desc")
		if err != nil {
			return err
		}
		if value == "" {
			return nil
		}

		//
		// 2. Get the stop_name value

		stopName, err := queries.Field(rowCtx.Source, "stop_name")
		if err != nil {
			return err
		}

		//
		// 3. Check if the stop_desc is different from the stop_name

		if value == stopName {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "duplicate", value, stopName))
			return nil
		}

		//
		// 4. Return success

		return nil
	})
}
