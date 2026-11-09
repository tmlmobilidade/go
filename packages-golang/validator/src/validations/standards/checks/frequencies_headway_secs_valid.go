package standard

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	"strconv"
)

/*
# Attributes

  - File: [frequencies.txt]
  - Field: headway_secs
  - Presence: Required
  - Type: Positive integer

# Description

Positive interval in seconds between departures during the period from start_time to end_time. Intervals for the
same trip must not overlap, but consecutive intervals may share an endpoint.

Validation: Checks that the populated value is an integer strictly greater than zero. Empty values are skipped;
required-field checks handle absence.

Presence and type describe the GTFS fields; they do not define the configured diagnostic severity.

[frequencies.txt]: https://gtfs.org/documentation/schedule/reference/#frequenciestxt
*/
func HeadwaySecsValid(ctx *context.ValidationContext) error {
	//
	// 1. Select this rule's source rows and required lookup tables.

	return context.ForEachRow(ctx, "frequencies", []string{"headway_secs"}, func(rowCtx *context.ValidationContext) error {
		if context.ShouldIgnore(rowCtx) {
			return nil
		}

		value, err := queries.Field(rowCtx.Source, "headway_secs")
		if err != nil {
			return err
		}

		//
		// 2. Skip empty headway_secs values

		if value == "" {
			return nil
		}

		//
		// 3. Convert the headway_secs to an integer

		parsed, err := strconv.Atoi(value)

		//
		// 4. Check if the headway_secs is positive

		if err != nil || parsed <= 0 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "invalid", value))
		}

		//
		// 5. Return success

		return nil
	})
}
