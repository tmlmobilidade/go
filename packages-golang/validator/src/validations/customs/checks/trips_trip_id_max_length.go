package custom

import (
	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: trip_id
  - Presence: Required
  - Type: Unique ID

# Description

Limits a populated trip identifier to 36 bytes.

Validation: Reports trip_id when its encoded byte length is greater than 36. It does not count Unicode characters
or validate uniqueness. Empty values are skipped, and whitespace counts toward the limit.

Example: A 36-character ASCII identifier passes, but 19 copies of á occupy 38 bytes in UTF-8 and exceed the limit.

Unavailable source or lookup tables skip the check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [trips.txt].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
*/
func TripIdMaxLength(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "trips")
	if err != nil || !ready {
		return err
	}

	return context.ForEachRow(ctx, "trips", []string{"trip_id_limit_characters", "trip_id"}, func(rowCtx *contextTypes.ValidationContext) error {
		//
		// 2. Get the trip_id value

		value, err := queries.Field(rowCtx.Source, "trip_id")
		if err != nil {
			return err
		}

		//
		// 3. Skip empty trip_id_limit_characters values

		if value == "" {
			return nil
		}

		//
		// 4. Check if the trip_id exceeds the maximum length

		if len(value) > 36 {
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "too_long"))
		}

		//
		// 5. Return success

		return nil
	})
}
