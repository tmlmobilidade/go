package custom

import (
	"sort"
	"strings"

	context "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/types/sqlite"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator-v2/src/validations/customs/utils"
)

/*
# Attributes
  - File: [trips.txt]
  - Field: trip_headsign
  - Presence: Required
  - Type: Text

# Description

 1. All trips with the same pattern_id must have the same trip_headsign
    (including consistent presence: nil/empty vs non-empty).
*/
func TripHeadsignPatternConsistent(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "trips")
	if err != nil || !ready {
		return err
	}

	return validationutils.ForEachGroup(ctx, "trips", "pattern_id", []string{"trip_headsign", "pattern_id"}, func(rowCtx *context.ValidationContext) error {
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
