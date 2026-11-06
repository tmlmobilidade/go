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
  - File: trips.txt
  - Field: trip_headsign

# Description

Each route_id may have at most two distinct trip_headsign values.
Trips with the same route_id and direction_id must share one trip_headsign.
Missing values and invalid directions are handled by their own rules.
*/
func TripHeadsignMaxTwoPerRoute(ctx *context.ValidationContext) error {
	//
	// 1. Select the source tables and keep derived state private to this invocation

	ready, err := validationutils.RequireTables(ctx, "trips")
	if err != nil || !ready {
		return err
	}

	return validationutils.ForEachGroup(ctx, "trips", "route_id", []string{"trip_headsign", "route_id"}, func(rowCtx *context.ValidationContext) error {
		//
		// 2. Check if the trip_headsign validation should run

		if context.ShouldSkip(rowCtx) {
			return nil
		}

		//
		// 3. Get the route_id value

		route, err := queries.Field(rowCtx.Source, "route_id")
		if err != nil {
			return err
		}
		values := map[int]map[string]bool{}
		firstRows := map[int]int{}

		//
		// 4. Collect trip_headsign values for the route_id group

		err = validationutils.ForGroupFields(rowCtx, "route_id", []string{"trip_headsign"}, func(row *sqliteTypes.SQLiteRow, fields map[string]string) error {
			value := fields["trip_headsign"]
			if value == "" {
				return nil
			}
			direction := 0
			if values[direction] == nil {
				values[direction] = map[string]bool{}
				firstRows[direction] = row.Row
			}
			values[direction][value] = true
			return nil
		})
		if err != nil {
			return err
		}

		//
		// 5. Check the trip_headsign values for each direction

		for direction := 0; direction <= 1; direction++ {
			if len(values[direction]) <= 2 {
				continue
			}

			keys := make([]string, 0, len(values[direction]))
			for value := range values[direction] {
				keys = append(keys, value)
			}
			sort.Strings(keys)
			validationutils.AddMessageAt(rowCtx, "trip_headsign", firstRows[direction], context.GetTranslatedMessage(rowCtx, "max_two", route, "trip_headsign", len(keys), strings.Join(keys, ", ")))
		}

		//
		// 6. Return success

		return nil
	})
}
