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
	// Get file rules

	var fileRules *types.RoutesRules
	if gtfsRules != nil {
		fileRules = &gtfsRules.Routes
	}
	runner, err := services.NewRuleRunner(gtfs, fileRules)
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
			"routes_agency_id_field":           func() { check("routes_agency_id_field", routes_fields.AgencyIdField(db, fileRules)) },
			"routes_continuous_drop_off_field": func() { check("routes_continuous_drop_off_field", routes_fields.ContinuousDropOffField(db, fileRules)) },
			"routes_continuous_pickup_field":   func() { check("routes_continuous_pickup_field", routes_fields.ContinuousPickupField(db, fileRules)) },
			"routes_line_id_field":             func() { check("routes_line_id_field", routes_fields.LineIdField(db, fileRules)) },
			"routes_line_long_name_field":      func() { check("routes_line_long_name_field", routes_fields.LineLongNameField(db, fileRules)) },
			"routes_line_short_name_field":     func() { check("routes_line_short_name_field", routes_fields.LineShortNameField(db, fileRules)) },
			"routes_network_id_field":          func() { check("routes_network_id_field", routes_fields.NetworkIdField(db, fileRules)) },
			"routes_path_type_field":           func() { check("routes_path_type_field", routes_fields.PathTypeField(db, fileRules)) },
			"routes_route_color_field":         func() { check("routes_route_color_field", routes_fields.RouteColorField(db, fileRules)) },
			"routes_route_desc_field":          func() { check("routes_route_desc_field", routes_fields.RouteDescField(db, fileRules)) },
			"routes_route_id_field":            func() { check("routes_route_id_field", routes_fields.RouteIdField(db, fileRules)) },
			"routes_route_long_name_field":     func() { check("routes_route_long_name_field", routes_fields.RouteLongNameField(db, fileRules)) },
			"routes_route_short_name_field":    func() { check("routes_route_short_name_field", routes_fields.RouteShortNameField(db, fileRules)) },
			"routes_route_sort_order_field":    func() { check("routes_route_sort_order_field", routes_fields.RouteSortOrderField(db, fileRules)) },
			"routes_route_text_color_field":    func() { check("routes_route_text_color_field", routes_fields.RouteTextColorField(db, fileRules)) },
			"routes_route_type_field":          func() { check("routes_route_type_field", routes_fields.RouteTypeField(db, fileRules)) },
			"routes_route_url_field":           func() { check("routes_route_url_field", routes_fields.RouteUrlField(db, fileRules)) },
			
			//
			// Standard
			"routes_agency_id_unique":                    func() { check("routes_agency_id_unique", routes_standard.AgencyIdUnique(db, fileRules)) },
			"routes_continuous_drop_off_valid_gtfs_enum": func() { check("routes_continuous_drop_off_valid_gtfs_enum", routes_standard.ContinuousDropOffValid(db, fileRules, routesWithWindows)) },
			"routes_continuous_pickup_valid_gtfs_enum":   func() { check("routes_continuous_pickup_valid_gtfs_enum", routes_standard.ContinuousPickupValid(db, fileRules, routesWithWindows)) },
			"routes_network_id_foreign":                  func() { check("routes_network_id_foreign", routes_standard.NetworkIdForeign(db, fileRules)) },
			"routes_route_color_valid":                   func() { check("routes_route_color_valid", routes_standard.RouteColorValid(db, fileRules)) },
			"routes_route_id_unique":                     func() { check("routes_route_id_unique", routes_standard.RouteIdUnique(db, fileRules)) },
			"routes_route_sort_order_valid":              func() { check("routes_route_sort_order_valid", routes_standard.RouteSortOrderValid(db, fileRules)) },
			"routes_route_text_color_valid":              func() { check("routes_route_text_color_valid", routes_standard.RouteTextColorValid(db, fileRules)) },
			"routes_route_type_valid":                    func() { check("routes_route_type_valid", routes_standard.RouteTypeValid(db, fileRules)) },
			"routes_route_url_different_agency_url":      func() { check("routes_route_url_different_agency_url", routes_standard.RouteUrlDifferentAgencyUrl(db, fileRules)) },
			"routes_route_url_valid":                     func() { check("routes_route_url_valid", routes_standard.RouteUrlValid(db, fileRules)) },
			
			//
			// Custom
			"routes_line_id_equal_route_short_name":         func() { check("routes_line_id_equal_route_short_name", routes_custom.LineIdEqualRouteShortName(db, fileRules)) },
			"routes_line_short_name_equal_route_short_name": func() { check("routes_line_short_name_equal_route_short_name", routes_custom.LineShortNameEqualRouteShortName(db, fileRules)) },
			"routes_path_type_valid":                        func() { check("routes_path_type_valid", routes_custom.PathTypeValid(db, fileRules)) },
			"routes_route_id_format":                        func() { check("routes_route_id_format", routes_custom.RouteIdFormat(db, fileRules)) },
		
		}, nil)
		return nil
	})

	//
	// Check for errors

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating routes: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed routes.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
