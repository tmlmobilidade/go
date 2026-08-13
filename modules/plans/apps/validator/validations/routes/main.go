package routes

import (
	"fmt"
	"main/config"
	"main/lib"
	"main/types"
	registry "main/validations"
	validations "main/validations/routes/validations"
)

func init() {
	registry.Register("routes", RunValidations)
}

func RunValidations(gtfs types.Gtfs, rules *types.GtfsRules) {
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
		validations.RouteIdValidation(&route, i, &gtfs)

		// Validate line_id
		validations.LineIdValidation(&route, i, &gtfs, routeRules)

		// Validate line_short_name
		validations.LineShortNameValidation(&route, i, &gtfs, routeRules)

		// Validate line_long_name
		validations.LineLongNameValidation(&route, i, &gtfs, routeRules)

		// Validate agency_id
		validations.AgencyIdValidation(&route, i, gtfs, routeRules)

		// Validate route_short_name
		validations.RouteShortNameValidation(&route, i, routeRules)

		// Validate route_long_name
		validations.RouteLongNameValidation(&route, i, routeRules)

		// Validate route_desc
		validations.RouteDescValidation(&route, i, routeRules)

		// Validate route_type
		validations.RouteTypeValidation(&route, i, routeRules)

		// Validate route_url
		validations.RouteUrlValidation(&route, i, &gtfs, routeRules)

		// Validate route_color
		validations.RouteColorValidation(&route, i, routeRules)

		// Validate route_text_color
		validations.RouteTextColorValidation(&route, i, routeRules)

		// Validate route_sort_order
		validations.RouteSortOrderValidation(&route, i, routeRules)

		// Validate continuous_drop_off (using pre-computed cache)
		validations.ContinuousDropOffValidation(&route, i, &gtfs, routeRules, routesWithWindows)

		// Validate continuous_pickup (using pre-computed cache)
		validations.ContinuousPickupValidation(&route, i, &gtfs, routeRules, routesWithWindows)

		// Validate network_id
		validations.NetworkIdValidation(&route, i, &gtfs, routeRules)

		// [CUSTOM VALIDATION] Validate path_type
		validations.PathTypeValidation(&route, i, routeRules)

		return nil
	})

	if err != nil {
		lib.AppLogger.Error(fmt.Sprintf("Error iterating routes: %v", err))
	} else {
		lib.AppLogger.Info(fmt.Sprintf("Completed routes.txt validation: %d rows processed", tracker.GetProcessedCount()))
	}
}
