package rules

import (
	"context"
	"database/sql"
	"fmt"
	"reflect"
	"strings"

	agency "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules/file-validations/agency"
	calendar "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules/file-validations/calendar"
	calendardates "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules/file-validations/calendar-dates"
	fareattributes "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules/file-validations/fare-attributes"
	farerules "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules/file-validations/fare-rules"
	feedinfo "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules/file-validations/feed-info"
	routes "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules/file-validations/routes"
	shapes "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules/file-validations/shapes"
	stoptimes "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules/file-validations/stop-times"
	stops "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules/file-validations/stops"
	trips "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules/file-validations/trips"
	vehicles "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules/file-validations/vehicles"
	geometry "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules/relationship-validations/geometry"
	pattern "github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/rules/relationship-validations/pattern"
	"github.com/tmlmobilidade/go/packages-golang/gtfs-validator/src/types"
)

type check func(context.Context, *sql.DB, types.Rule) (bool, []Finding, error)

// checks exposes the rule methods from each table package. New methods in these
// packages are available automatically after rebuilding the validator.
type checks struct {
	
	// File Validations
	agency.AgencyChecks
	calendar.CalendarChecks
	calendardates.CalendarDatesChecks
	fareattributes.FareAttributesChecks
	farerules.FareRulesChecks
	feedinfo.FeedInfoChecks
	routes.RoutesChecks
	shapes.ShapesChecks
	stoptimes.StopTimesChecks
	stops.StopsChecks
	trips.TripsChecks
	vehicles.VehiclesChecks

	// Relationship Validations
	geometry.GeometryChecks
	pattern.PatternChecks
}

// findCheck matches snake_case IDs to exported methods, including acronyms such
// as ID, URL, and GTFS. Reflection is only used while building the graph.
// A nil check without an error means the rule has no implementation.
func findCheck(ruleID string) (check, error) {
	if ruleID == "file_validation" || ruleID == "file_not_found_in_rules" {
		return nil, fmt.Errorf("%w: reserved notice ID %q", ErrInvalidConfiguration, ruleID)
	}
	name := strings.ReplaceAll(ruleID, "_", "")
	receiver := reflect.ValueOf(checks{})
	receiverType := receiver.Type()
	var match reflect.Value
	for i := range receiver.NumMethod() {
		if !strings.EqualFold(receiverType.Method(i).Name, name) {
			continue
		}
		if match.IsValid() {
			return nil, fmt.Errorf("%w: ambiguous executable rule %q", ErrInvalidConfiguration, ruleID)
		}
		match = receiver.Method(i)
	}
	if !match.IsValid() {
		return nil, nil
	}
	validate, ok := match.Interface().(func(context.Context, *sql.DB, types.Rule) (bool, []Finding, error))
	if !ok {
		return nil, fmt.Errorf("%w: rule %q has an invalid check signature", ErrInvalidConfiguration, ruleID)
	}
	return validate, nil
}
