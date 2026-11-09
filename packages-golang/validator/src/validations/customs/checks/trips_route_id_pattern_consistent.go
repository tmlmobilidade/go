package custom

import (
	"sort"
	"strings"

	context "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/context"
	queries "github.com/tmlmobilidade/go/packages-golang/validator/src/services/sqlite/queries"
	sqliteTypes "github.com/tmlmobilidade/go/packages-golang/validator/src/types/sqlite"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/customs/utils"
)

/*
# Attributes

  - File: [trips.txt]
  - Field: [pattern_id, route_id]
  - Presence: Configurable, Required
  - Type: ID, Foreign ID referencing routes.route_id

# Description

Keeps a single populated route identifier within each non-empty pattern_id group.

Validation: Collects distinct non-empty route_id strings and reports a group containing more than one. Matching
preserves whitespace and letter case. Empty route identifiers are ignored; their presence and references are
checked separately.

Rows with an empty pattern_id are not grouped. The comparison is skipped when this rule is configured as forbidden.
Unavailable source or lookup tables skip the check.

Custom policy documented from the implementation and its tests. Presence and type describe the input fields, not
the diagnostic severity. The related table references provide field context, not an external specification for this
policy.

Related tables: [trips.txt].

[trips.txt]: https://go.tmlmobilidade.pt/reference/gtfs/schedule/trips
*/
func RouteIdPatternConsistent(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "trips")
	if err != nil || !ready {
		return err
	}

	return validationutils.ForEachGroup(ctx, "trips", "pattern_id", []string{"route_id", "pattern_id"}, func(rowCtx *context.ValidationContext) error {
		//
		// 2. Check if the route_id validation should run

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
		// 4. Collect route_id values for the pattern_id group

		err = validationutils.ForGroupFields(rowCtx, "pattern_id", []string{"route_id"}, func(_ *sqliteTypes.SQLiteRow, fields map[string]string) error {
			value := fields["route_id"]
			if value != "" {
				values[value] = true
			}
			return nil
		})
		if err != nil {
			return err
		}

		//
		// 5. Check if the route_id values are consistent within the group

		if len(values) > 1 {
			keys := make([]string, 0, len(values))
			for value := range values {
				keys = append(keys, value)
			}
			sort.Strings(keys)
			context.AddMessage(rowCtx, context.GetTranslatedMessage(rowCtx, "different_route_ids_in_pattern", pattern, strings.Join(keys, ", ")))
		}

		//
		// 6. Return success

		return nil
	})
}
