package routes

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	routes_custom "main/validations/routes/custom/checks"
	routes_fields "main/validations/routes/fields/checks"
	routes_standard "main/validations/routes/standard/checks"
	routes_utils "main/validations/routes/utils"
)

func init() {
	registry.RegisterWithTables("routes", RunValidations)
}

func RunValidations(gtfs types.Gtfs, gtfsRules *types.GtfsRules, prepared ...*services.SQLiteTables) {
	lib.AppLogger.Debug("Running Validations for routes.txt")

	//
	// Create progress tracker

	tracker := lib.CreateProgressTracker(gtfs, "routes", config.ProgressThresholdLarge)

	//
	// Create the rule runner

	runner, err := services.NewRuleRunner(gtfs, gtfsRules, "routes")
	if err != nil {
		lib.AppLogger.Error(err.Error())
		return
	}

	//
	// Select the prepared routes table

	tables, err := services.ValidationTables(gtfs.DB(), prepared...)
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error preparing SQLite tables: %v", err))
		return
	}

	//
	// Prepare pickup/drop-off window lookups once for all route rows

	routesWithWindows, err := routes_utils.RoutesWithWindows(tables)
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error preparing routes with pickup/drop-off windows: %v", err))
		return
	}

	//
	// Iterate over routes table

	err = tables.ForEachRow("routes", func(row *services.SQLiteRow) error {
		db := row.Context()
		tracker.Track()
		check := func(ruleID string, err error) {
			if err != nil {
				ctx := lib.NewValidationContext("N/A", "routes.txt", ruleID, db.Row, services.AppMessageService)
				ctx.AddError(fmt.Sprintf("SQLite read failed: %v", err))
			}
		}

		runner.Run(services.RuleActions{
			//
			// Fields
			"routes_agency_id_field": func() {
				check("routes_agency_id_field", routes_fields.AgencyIdField(db, gtfsRules.Rule("routes_agency_id_field")))
			},
			"routes_continuous_drop_off_field": func() {
				check("routes_continuous_drop_off_field", routes_fields.ContinuousDropOffField(db, gtfsRules.Rule("routes_continuous_drop_off_field")))
			},
			"routes_continuous_pickup_field": func() {
				check("routes_continuous_pickup_field", routes_fields.ContinuousPickupField(db, gtfsRules.Rule("routes_continuous_pickup_field")))
			},
			"routes_line_id_field": func() {
				check("routes_line_id_field", routes_fields.LineIdField(db, gtfsRules.Rule("routes_line_id_field")))
			},
			"routes_line_long_name_field": func() {
				check("routes_line_long_name_field", routes_fields.LineLongNameField(db, gtfsRules.Rule("routes_line_long_name_field")))
			},
			"routes_line_short_name_field": func() {
				check("routes_line_short_name_field", routes_fields.LineShortNameField(db, gtfsRules.Rule("routes_line_short_name_field")))
			},
			"routes_network_id_field": func() {
				check("routes_network_id_field", routes_fields.NetworkIdField(db, gtfsRules.Rule("routes_network_id_field")))
			},
			"routes_path_type_field": func() {
				check("routes_path_type_field", routes_fields.PathTypeField(db, gtfsRules.Rule("routes_path_type_field")))
			},
			"routes_route_color_field": func() {
				check("routes_route_color_field", routes_fields.RouteColorField(db, gtfsRules.Rule("routes_route_color_field")))
			},
			"routes_route_desc_field": func() {
				check("routes_route_desc_field", routes_fields.RouteDescField(db, gtfsRules.Rule("routes_route_desc_field")))
			},
			"routes_route_id_field": func() {
				check("routes_route_id_field", routes_fields.RouteIdField(db, gtfsRules.Rule("routes_route_id_field")))
			},
			"routes_route_long_name_field": func() {
				check("routes_route_long_name_field", routes_fields.RouteLongNameField(db, gtfsRules.Rule("routes_route_long_name_field")))
			},
			"routes_route_short_name_field": func() {
				check("routes_route_short_name_field", routes_fields.RouteShortNameField(db, gtfsRules.Rule("routes_route_short_name_field")))
			},
			"routes_route_sort_order_field": func() {
				check("routes_route_sort_order_field", routes_fields.RouteSortOrderField(db, gtfsRules.Rule("routes_route_sort_order_field")))
			},
			"routes_route_text_color_field": func() {
				check("routes_route_text_color_field", routes_fields.RouteTextColorField(db, gtfsRules.Rule("routes_route_text_color_field")))
			},
			"routes_route_type_field": func() {
				check("routes_route_type_field", routes_fields.RouteTypeField(db, gtfsRules.Rule("routes_route_type_field")))
			},
			"routes_route_url_field": func() {
				check("routes_route_url_field", routes_fields.RouteUrlField(db, gtfsRules.Rule("routes_route_url_field")))
			},

			//
			// Standard
			"routes_agency_id_foreign": func() {
				check("routes_agency_id_foreign", routes_standard.AgencyIdUnique(db, gtfsRules.Rule("routes_agency_id_foreign")))
			},
			"routes_continuous_drop_off_valid": func() {
				check("routes_continuous_drop_off_valid", routes_standard.ContinuousDropOffValid(db, gtfsRules.Rule("routes_continuous_drop_off_valid"), routesWithWindows))
			},
			"routes_continuous_pickup_valid": func() {
				check("routes_continuous_pickup_valid", routes_standard.ContinuousPickupValid(db, gtfsRules.Rule("routes_continuous_pickup_valid"), routesWithWindows))
			},
			"routes_network_id_foreign": func() {
				check("routes_network_id_foreign", routes_standard.NetworkIdForeign(db, gtfsRules.Rule("routes_network_id_foreign")))
			},
			"routes_route_color_valid": func() {
				check("routes_route_color_valid", routes_standard.RouteColorValid(db, gtfsRules.Rule("routes_route_color_valid")))
			},
			"routes_route_id_unique": func() {
				check("routes_route_id_unique", routes_standard.RouteIdUnique(db, gtfsRules.Rule("routes_route_id_unique")))
			},
			"routes_route_sort_order_valid": func() {
				check("routes_route_sort_order_valid", routes_standard.RouteSortOrderValid(db, gtfsRules.Rule("routes_route_sort_order_valid")))
			},
			"routes_route_text_color_valid": func() {
				check("routes_route_text_color_valid", routes_standard.RouteTextColorValid(db, gtfsRules.Rule("routes_route_text_color_valid")))
			},
			"routes_route_type_valid": func() {
				check("routes_route_type_valid", routes_standard.RouteTypeValid(db, gtfsRules.Rule("routes_route_type_valid")))
			},
			"routes_route_url_different_from_agency_url": func() {
				check("routes_route_url_different_from_agency_url", routes_standard.RouteUrlDifferentAgencyUrl(db, gtfsRules.Rule("routes_route_url_different_from_agency_url")))
			},
			"routes_route_url_valid": func() {
				check("routes_route_url_valid", routes_standard.RouteUrlValid(db, gtfsRules.Rule("routes_route_url_valid")))
			},

			//
			// Custom
			"routes_line_id_equal_route_short_name": func() {
				check("routes_line_id_equal_route_short_name", routes_custom.LineIdEqualRouteShortName(db, gtfsRules.Rule("routes_line_id_equal_route_short_name")))
			},
			"routes_line_short_name_equal_route_short_name": func() {
				check("routes_line_short_name_equal_route_short_name", routes_custom.LineShortNameEqualRouteShortName(db, gtfsRules.Rule("routes_line_short_name_equal_route_short_name")))
			},
			"routes_path_type_valid": func() {
				check("routes_path_type_valid", routes_custom.PathTypeValid(db, gtfsRules.Rule("routes_path_type_valid")))
			},
			"routes_route_id_format": func() {
				check("routes_route_id_format", routes_custom.RouteIdFormat(db, gtfsRules.Rule("routes_route_id_format")))
			},
		}, nil)
		return nil
	})

	//
	// Check for errors

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating routes: %v", err))
	} else {
		tracker.Complete()
		lib.AppLogger.Info(fmt.Sprintf("Completed routes.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
