package trips_custom

import (
	"main/lib"
	"main/services"
	"main/types"
	trips_utils "main/validations/trips/utils"
	"sort"
	"strings"
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
func TripHeadsignMaxTwoPerRoute(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "trip_headsign_max_two_per_route"
	ctx := lib.NewValidationContext("trip_headsign", "trips.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	if ctx.ShouldSkip() {
		return nil
	}
	route, err := db.Trips.Field("route_id")
	if err != nil {
		return err
	}
	values := map[int]map[string]bool{}
	firstRows := map[int]int{}
	err = trips_utils.ForGroup(db, "route_id", func(row *services.SQLiteRow) error {
		fields, err := row.Fields("trip_headsign", "direction_id")
		if err != nil {
			return err
		}
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
	for direction := 0; direction <= 1; direction++ {
		if len(values[direction]) <= 2 {
			continue
		}
		groupCtx := lib.NewValidationContext("trip_headsign", "trips.txt", ruleID, firstRows[direction], services.AppMessageService)
		if rules != nil {
			groupCtx.WithSeverity(rules.Severity)
		}
		keys := make([]string, 0, len(values[direction]))
		for value := range values[direction] {
			keys = append(keys, value)
		}
		sort.Strings(keys)
		groupCtx.AddMessageWithSeverity(groupCtx.GetTranslatedMessage("max_two", route, "trip_headsign", len(keys), strings.Join(keys, ", ")))
	}
	return nil
}
