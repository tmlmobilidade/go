package routes_standard

import (
	"main/lib"
	"main/services"
	"main/types"
)

func RouteUrlDifferentAgencyUrl(db *services.SQLiteContext, rules *types.RoutesRules) error {
	//

	//
	// 1. Get the rule

	const ruleID = "routes_route_url_different_agency_url"

	//
	// 2. Create the validation context

	ctx := lib.NewValidationContext("route_url", "routes.txt", ruleID, db.Row, services.AppMessageService)
	if rules != nil {
		rule := rules.Rule(ruleID)
		ctx.WithSeverity(rule.Severity)
	}

	//
	// 3. Get the route_url value

	routeUrl, err := db.Routes.Field("route_url")
	if err != nil {
		return err
	}

	agencyUrl, err := db.Agency.Field("agency_url")
	if err != nil {
		return err
	}

	//
	// 4. Check if the route_url is different from the agency_url

	if routeUrl == agencyUrl {
		ctx.AddMessageWithSeverity(ctx.GetTranslatedMessage("invalid", routeUrl))
		return nil
	}

	//
	// 5. Return success

	return nil
}	