package custom

import (
	"sort"
	"strconv"
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
  - Field: [pattern_id, direction_id]
  - Presence: Configurable, Optional
  - Type: ID, Enum

# Description

Keeps a single parsed direction value within each non-empty pattern_id group.

Validation: Collects the distinct integer values of direction_id and reports a group with more than one. Unreadable
and empty directions are ignored. Numeric spelling is normalized, so 01 and 1 are equivalent. This check does not
restrict directions to 0 and 1; it only compares the integers that can be read.

Rows with an empty pattern_id are not grouped. The comparison is skipped when this rule is configured as forbidden.
Unavailable source or lookup tables skip the check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [trips.txt].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
*/
func DirectionIdPatternConsistent(ctx *contextTypes.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "trips")
	if err != nil || !ready {
		return err
	}

	return validationutils.ForEachGroup(ctx, "trips", "pattern_id", []string{"direction_id", "pattern_id"}, func(rowCtx *contextTypes.ValidationContext) error {
		//
		// 2. Check if the direction_id is consistent for all patterns in trips

		if context.ShouldSkip(rowCtx) {
			return nil
		}

		//
		// 3. Get the pattern_id value

		pattern, err := queries.Field(rowCtx.Source, "pattern_id")
		if err != nil {
			return err
		}

		//
		// 4. Check if the direction_id is consistent for all patterns in trips

		values := map[string]bool{}
		err = validationutils.ForGroupFields(rowCtx, "pattern_id", []string{"direction_id"}, func(_ *sqliteTypes.SQLiteRow, fields map[string]string) error {
			value := fields["direction_id"]
			parsed, err := strconv.Atoi(value)
			if err != nil {
				return nil
			}
			value = strconv.Itoa(parsed)
			if value != "" {
				values[value] = true
			}
			return nil
		})

		if err != nil {
			return err
		}

		//
		// 5. Check if the direction_id is consistent for all patterns in trips

		if len(values) > 1 {
			keys := make([]string, 0, len(values))
			for value := range values {
				keys = append(keys, value)
			}
			sort.Slice(keys, func(i, j int) bool { a, _ := strconv.Atoi(keys[i]); b, _ := strconv.Atoi(keys[j]); return a < b })
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "different_direction_ids_in_pattern", pattern, strings.Join(keys, ", ")))
		}

		//
		// 6. Return success

		return nil
	})
}
