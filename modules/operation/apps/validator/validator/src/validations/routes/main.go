package routes

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/services"
	"main/types"
	registry "main/validations"
	validations "main/validations/routes/validations"
)

func init() {
	registry.Register("routes", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
	var section *types.RoutesRules
	if rules != nil {
		section = &rules.Routes
	}
	runner, dagErr := services.NewRuleRunner(gtfs, section)
	if dagErr != nil {
		lib.AppLogger.Error(dagErr.Error())
		return
	}
	lib.AppLogger.Debug("Running Routes Validations...")

	// Pre-compute trip_id -> route_id mapping for performance
	// This avoids repeated database queries when checking continuous pickup/dropoff
	lib.AppLogger.Debug("Pre-computing trip_id -> route_id mapping...")
	tripToRouteMap := make(map[string]string) // trip_id -> route_id
	err := gtfs.IterateTrips(func(i int, rawTrip types.TripRaw) error {
		if rawTrip.TripId != "" && rawTrip.RouteId != "" {
			tripToRouteMap[rawTrip.TripId] = rawTrip.RouteId
		}
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error pre-computing trip to route mapping: %v", err))
	}
	lib.AppLogger.Debug(fmt.Sprintf("Pre-computed route mapping for %d trips", len(tripToRouteMap)))

	// Pre-compute which routes have trips with pickup/dropoff windows
	// This avoids expensive nested loops in continuous pickup/dropoff validation
	lib.AppLogger.Debug("Pre-computing routes with pickup/dropoff windows...")
	routesWithWindows := make(map[string]bool) // route_id -> has windows
	err = gtfs.IterateStopTimes(func(i int, rawStopTime types.StopTimeRaw) error {
		if rawStopTime.TripId == "" {
			return nil
		}
		// Check if this stop_time has pickup/dropoff windows
		if rawStopTime.StartPickupDropOffWindow != "" || rawStopTime.EndPickupDropOffWindow != "" {
			// Get route_id for this trip
			if routeId, exists := tripToRouteMap[rawStopTime.TripId]; exists {
				routesWithWindows[routeId] = true
			}
		}
		return nil
	})
	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error pre-computing routes with windows: %v", err))
	}
	lib.AppLogger.Debug(fmt.Sprintf("Pre-computed windows for %d routes", len(routesWithWindows)))

	// Create progress tracker
	tracker := lib.CreateProgressTracker(gtfs, "routes", config.ProgressThresholdLarge)

	err = gtfs.IterateRoutes(func(i int, rawRoute types.RouteRaw) error {
		tracker.Track()
		route := validations.ParseRoutes(rawRoute, i)

		if route == (types.Route{}) {
			return nil
		}

		var routeRules *types.RoutesRules
		if rules != nil {
			routeRules = &rules.Routes
		}

		// Validate route_id
		runner.Run(services.RuleActions{
			"route_id_unique":                                     func() { validations.RouteIdValidation(&route, i, &gtfs) },
			"routes_line_id_required":                             func() { validations.LineIdValidation(&route, i, &gtfs, routeRules) },
			"routes_line_short_name_present_when_line_id_present": func() { validations.LineShortNameValidation(&route, i, &gtfs, routeRules) },
			"routes_line_long_name_present_when_line_id_present":  func() { validations.LineLongNameValidation(&route, i, &gtfs, routeRules) },
			"route_agency_id_references_agency_table":             func() { validations.AgencyIdValidation(&route, i, gtfs, routeRules) },
			"route_short_name_or_long_name_present":               func() { validations.RouteShortNameValidation(&route, i, routeRules) },
			"route_long_name_or_short_name_present":               func() { validations.RouteLongNameValidation(&route, i, routeRules) },
			"route_desc_per_severity_and_content_rules":           func() { validations.RouteDescValidation(&route, i, routeRules) },
			"route_type_valid_gtfs_enum":                          func() { validations.RouteTypeValidation(&route, i, routeRules) },
			"route_url_valid_http_url":                            func() { validations.RouteUrlValidation(&route, i, &gtfs, routeRules) },
			"route_color_valid_hex_string":                        func() { validations.RouteColorValidation(&route, i, routeRules) },
			"route_text_color_valid_hex_contrast":                 func() { validations.RouteTextColorValidation(&route, i, routeRules) },
			"route_sort_order_non_negative_integer":               func() { validations.RouteSortOrderValidation(&route, i, routeRules) },
			"routes_continuous_drop_off_valid_gtfs_enum":          func() { validations.ContinuousDropOffValidation(&route, i, &gtfs, routeRules, routesWithWindows) },
			"routes_continuous_pickup_valid_gtfs_enum":            func() { validations.ContinuousPickupValidation(&route, i, &gtfs, routeRules, routesWithWindows) },
			"routes_network_id_references_networks_table":         func() { validations.NetworkIdValidation(&route, i, &gtfs, routeRules) },
			"routes_path_type_valid_enum":                         func() { validations.PathTypeValidation(&route, i, routeRules) },
		}, nil)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating routes: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed routes.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
