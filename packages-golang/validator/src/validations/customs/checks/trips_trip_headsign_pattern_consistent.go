package custom

import (
	"sort"
	"strings"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	contextTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/context"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: [pattern_id, trip_headsign]
  - Presence: Configurable, Optional
  - Type: ID, Text

# Description

Keeps one headsign text within each non-empty pattern_id group.

Validation: Collects every distinct trip_headsign string, including the empty string, and reports a group
containing more than one. Empty and populated headsigns therefore conflict. A group with only empty headsigns does
not report a consistency problem. Matching preserves whitespace and letter case.

Rows with an empty pattern_id are not grouped. The comparison is skipped when this rule is configured as forbidden.
Unavailable source or lookup tables skip the check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [trips.txt].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
*/
func TripHeadsignPatternConsistent(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "trips")
	if err != nil || !ready {
		return err
	}

	return validationutils.ForEachGroup(ctx, "trips", "pattern_id", []string{"trip_headsign", "pattern_id"}, func(rowCtx *contextTypes.ValidationContext) error {
		//
		// 2. Check if the trip_headsign validation should run

		if context.ShouldSkip(rowCtx) {
			return nil
		}

		//
		// 3. Get the pattern_id value

		pattern, err := queries.Field(rowCtx.Source, "pattern_id")
		if err != nil {
			return err
		}
		values := map[string]bool{}

		//
		// 4. Collect trip_headsign values for the pattern_id group

		err = validationutils.ForGroupFields(rowCtx, "pattern_id", []string{"trip_headsign"}, func(_ *sqliteTypes.SQLiteRow, fields map[string]string) error {
			value := fields["trip_headsign"]
			values[value] = true
			return nil
		})
		if err != nil {
			return err
		}

		//
		// 5. Check if the trip_headsign values are consistent within the group

		if len(values) > 1 {
			keys := make([]string, 0, len(values))
			for value := range values {
				keys = append(keys, value)
			}
			sort.Strings(keys)
			for i, value := range keys {
				if value == "" {
					keys[i] = "[empty]"
				}
			}
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "different_headsigns_in_pattern", pattern, strings.Join(keys, ", ")))
		}

		//
		// 6. Return success

		return nil
	})
}
