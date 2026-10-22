package pathways_standard

import (
	"main/lib"
	"main/services"
	"main/types"
	"strconv"
)

/*
# Attributes
- File: [pathways.txt]
- Field: from_stop_id
- Presence: Required
- Type: Foreign ID referencing stops.stop_id

# Description
Identifies the stop where the pathway starts.

Must contain a stop_id that identifies a platform (location_type=0 or empty), entrance/exit (location_type=2), generic node (location_type=3) or boarding area (location_type=4).

Values for stop_id that identify stations (location_type=1), or stops (location_type=0 or empty) with stop_access=1, are forbidden.

[pathways.txt]: https://gtfs.org/schedule/reference/#pathwaystxt

[stops.stop_id]: https://gtfs.org/schedule/reference/#stopstxt
*/
func FromStopIdValid(db *services.SQLiteContext, rules *types.RuleContext) error {
	const ruleID = "pathway_from_stop_id_references_stops_table"
	ctx := lib.NewValidationContext("from_stop_id", "pathways.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		ctx.WithSeverity(rules.Severity)
	}
	value, err := db.Pathways.Field("from_stop_id")
	if err != nil {
		return err
	}
	if value == "" {
		return nil
	}
	table, err := db.Table("stops")
	if err != nil {
		return err
	}
	found := false
	err = table.ForEachMatching("stop_id", value, func(row *services.SQLiteRow) error {
		if found {
			return nil
		}
		found = true
		values, err := row.Fields("location_type", "stop_access")
		if err != nil {
			return err
		}
		locationType := 0
		if values["location_type"] != "" {
			locationType, err = strconv.Atoi(values["location_type"])
			if err != nil {
				ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid_location_type_format", value))
				return nil
			}
		}
		if locationType == 1 {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid_location_type_station", value))
			return nil
		}
		if locationType != 0 && locationType != 2 && locationType != 3 && locationType != 4 {
			ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid_location_type_pathway", value, locationType))
			return nil
		}
		if locationType == 0 {
			access := 0
			if values["stop_access"] != "" {
				access, err = strconv.Atoi(values["stop_access"])
				if err != nil {
					ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid_stop_access_format", value))
					return nil
				}
			}
			if access == 1 {
				ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("forbidden_stop_access_1", value))
			}
		}
		return nil
	})
	if err != nil {
		return err
	}
	if !found {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("not_found", value))
	}

	return nil
}
