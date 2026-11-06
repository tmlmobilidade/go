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
  - Field: route_id
  - Presence: Optional
  - Type: ID

# Description

Validates if route_id is unique within each pattern_id.
All trips with the same pattern_id must have the same route_id.
If a pattern_id has trips with different route_ids, report error.
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
