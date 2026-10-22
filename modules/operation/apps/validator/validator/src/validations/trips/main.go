package trips

import (
	"fmt"
	"main/config"
	"main/lib"
	ruleset "main/lib/rules"
	"main/services"
	"main/types"
	registry "main/validations"
	trips_custom "main/validations/trips/custom/checks"
	trips_fields "main/validations/trips/fields/checks"
	trips_standard "main/validations/trips/standard/checks"
	trips_utils "main/validations/trips/utils"
)

func init() { registry.RegisterWithTables("trips", RunValidations) }

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	runner, err := services.NewRuleRunner(gtfs, rules, "trips")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	table, err := tables.Table("trips")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}
	tracker := lib.CreateProgressTracker(gtfs, "trips", config.ProgressThresholdLarge)
	hashes := map[int]string{}
	reported := map[[2]string]bool{}
	geometry := trips_utils.Geometry{}

	// One action map owns all row and grouped rules. Configuration orders each
	// phase's prerequisites; grouped phases receive only their own rows' outcomes.
	actions := func(db *services.SQLiteContext, scope string) services.RuleActions {
		check := func(id string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "trips.txt", id, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}
		all := services.RuleActions{
			"trips_route_id_field": func() {
				check("trips_route_id_field", trips_fields.RouteIdField(db, rules.Rule("trips_route_id_field")))
			},
			"trips_service_id_field": func() {
				check("trips_service_id_field", trips_fields.ServiceIdField(db, rules.Rule("trips_service_id_field")))
			},
			"trips_trip_id_field": func() { check("trips_trip_id_field", trips_fields.TripIdField(db, rules.Rule("trips_trip_id_field"))) },
			"trips_trip_headsign_field": func() {
				check("trips_trip_headsign_field", trips_fields.TripHeadsignField(db, rules.Rule("trips_trip_headsign_field")))
			},
			"trips_trip_short_name_field": func() {
				check("trips_trip_short_name_field", trips_fields.TripShortNameField(db, rules.Rule("trips_trip_short_name_field")))
			},
			"trips_direction_id_field": func() {
				check("trips_direction_id_field", trips_fields.DirectionIdField(db, rules.Rule("trips_direction_id_field")))
			},
			"trips_block_id_field": func() {
				check("trips_block_id_field", trips_fields.BlockIdField(db, rules.Rule("trips_block_id_field")))
			},
			"trips_shape_id_field": func() {
				check("trips_shape_id_field", trips_fields.ShapeIdField(db, rules.Rule("trips_shape_id_field")))
			},
			"trips_wheelchair_accessible_field": func() {
				check("trips_wheelchair_accessible_field", trips_fields.WheelchairAccessibleField(db, rules.Rule("trips_wheelchair_accessible_field")))
			},
			"trips_bikes_allowed_field": func() {
				check("trips_bikes_allowed_field", trips_fields.BikesAllowedField(db, rules.Rule("trips_bikes_allowed_field")))
			},
			"trips_pattern_id_field": func() {
				check("trips_pattern_id_field", trips_fields.PatternIdField(db, rules.Rule("trips_pattern_id_field")))
			},
			"trips_trip_id_unique": func() { check("trips_trip_id_unique", trips_standard.TripIdUnique(db, rules.Rule("trips_trip_id_unique"))) },
			"trips_route_id_foreign": func() {
				check("trips_route_id_foreign", trips_standard.RouteIdForeign(db, rules.Rule("trips_route_id_foreign")))
			},
			"trips_shape_id_foreign": func() {
				check("trips_shape_id_foreign", trips_standard.ShapeIdForeign(db, rules.Rule("trips_shape_id_foreign")))
			},
			"trips_service_id_foreign": func() {
				check("trips_service_id_foreign", trips_standard.ServiceIdForeign(db, rules.Rule("trips_service_id_foreign")))
			},
			"trips_direction_id_valid": func() {
				check("trips_direction_id_valid", trips_standard.DirectionIdValid(db, rules.Rule("trips_direction_id_valid")))
			},
			"trips_bikes_allowed_valid": func() {
				check("trips_bikes_allowed_valid", trips_standard.BikesAllowedValid(db, rules.Rule("trips_bikes_allowed_valid")))
			},
			"trips_wheelchair_accessible_valid": func() {
				check("trips_wheelchair_accessible_valid", trips_standard.WheelchairAccessibleValid(db, rules.Rule("trips_wheelchair_accessible_valid")))
			},
			"trips_trip_id_max_length": func() {
				check("trips_trip_id_max_length", trips_custom.TripIdMaxLength(db, rules.Rule("trips_trip_id_max_length")))
			},
			"trips_pattern_id_same_shape_id": func() {
				check("trips_pattern_id_same_shape_id", trips_custom.PatternIdSameShapeId(db, rules.Rule("trips_pattern_id_same_shape_id")))
			},
			"trips_shape_id_route_direction_match": func() {
				check("trips_shape_id_route_direction_match", trips_custom.ShapeIdRouteDirectionMatch(db, rules.Rule("trips_shape_id_route_direction_match")))
			},
			"trips_direction_pattern_id_match": func() {
				check("trips_direction_pattern_id_match", trips_custom.DirectionPatternIdMatch(db, rules.Rule("trips_direction_pattern_id_match")))
			},
			"trips_pattern_id_format": func() {
				check("trips_pattern_id_format", trips_custom.PatternIdFormat(db, rules.Rule("trips_pattern_id_format")))
			},
			"trips_route_id_pattern_consistent": func() {
				check("trips_route_id_pattern_consistent", trips_custom.RouteIdPatternConsistent(db, rules.Rule("trips_route_id_pattern_consistent")))
			},
			"trips_direction_id_pattern_consistent": func() {
				check("trips_direction_id_pattern_consistent", trips_custom.DirectionIdPatternConsistent(db, rules.Rule("trips_direction_id_pattern_consistent")))
			},
			"trips_trip_headsign_pattern_consistent": func() {
				check("trips_trip_headsign_pattern_consistent", trips_custom.TripHeadsignPatternConsistent(db, rules.Rule("trips_trip_headsign_pattern_consistent")))
			},
			"trips_shape_id_max_two_per_route": func() {
				check("trips_shape_id_max_two_per_route", trips_custom.ShapeIdMaxTwoPerRoute(db, rules.Rule("trips_shape_id_max_two_per_route")))
			},
			"trips_shape_id_route_direction_consistent": func() {
				check("trips_shape_id_route_direction_consistent", trips_custom.ShapeIdRouteDirectionConsistent(db, rules.Rule("trips_shape_id_route_direction_consistent")))
			},
			"trips_trip_headsign_max_two_per_route": func() {
				check("trips_trip_headsign_max_two_per_route", trips_custom.TripHeadsignMaxTwoPerRoute(db, rules.Rule("trips_trip_headsign_max_two_per_route")))
			},
			"trips_trip_headsign_route_direction_consistent": func() {
				check("trips_trip_headsign_route_direction_consistent", trips_custom.TripHeadsignRouteDirectionConsistent(db, rules.Rule("trips_trip_headsign_route_direction_consistent")))
			},
			"trips_pattern_required_fields": func() {
				check("trips_pattern_required_fields", trips_custom.PatternRequiredFields(db, rules.Rule("trips_pattern_required_fields")))
			},
			"trips_one_shape_per_pattern": func() {
				check("trips_one_shape_per_pattern", trips_custom.OneShapePerPattern(db, rules.Rule("trips_one_shape_per_pattern"), reported))
			},
			"trips_one_pattern_per_shape": func() {
				check("trips_one_pattern_per_shape", trips_custom.OnePatternPerShape(db, rules.Rule("trips_one_pattern_per_shape"), reported))
			},
			"trips_stop_sequence": func() {
				check("trips_stop_sequence", trips_custom.StopSequence(db, rules.Rule("trips_stop_sequence"), hashes))
			},
			"trips_pattern_single_signature": func() {
				check("trips_pattern_single_signature", trips_custom.PatternSingleSignature(db, rules.Rule("trips_pattern_single_signature"), hashes))
			},
			"trips_stop_coordinates": func() {
				check("trips_stop_coordinates", trips_custom.StopCoordinates(db, rules.Rule("trips_stop_coordinates"), &geometry))
			},
		}
		for id := range all {
			if ruleset.ExecutionScope(id) != scope {
				delete(all, id)
			}
		}
		return all
	}
	type group struct {
		row      int
		statuses map[string]ruleset.Status
	}
	groups := map[string]map[string]*group{"route": {}, "pattern": {}, "shape": {}}
	order := map[string][]string{}
	err = table.ForEachRow(func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		statuses := runner.Run(actions(db, ""), nil)
		values, err := db.Trips.Fields("route_id", "pattern_id", "shape_id")
		if err != nil {
			return err
		}
		for _, scope := range []string{"route", "pattern", "shape"} {
			key := values[scope+"_id"]
			if key == "" {
				continue
			}
			current := groups[scope][key]
			if current == nil {
				current = &group{row: db.Row}
				groups[scope][key] = current
				order[scope] = append(order[scope], key)
			}
			current.statuses = services.MergeRuleStatuses(current.statuses, statuses)
		}
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error validating trips: %v", err))
		return
	}
	// Pattern checks must precede shape checks: only actually reported pattern
	// conflicts suppress the corresponding shape-side duplicate diagnostic.
	for _, scope := range []string{"route", "pattern", "shape"} {
		for _, key := range order[scope] {
			current := groups[scope][key]
			runner.Run(actions(table.At(current.row).Context(), scope), current.statuses)
		}
	}
	lib.AppLogger.Info(fmt.Sprintf("Completed trips.txt validation: %d rows processed", tracker.GetProcessedCount()))
}
