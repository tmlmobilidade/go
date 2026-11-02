package standard

import (
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/i18n"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/services"
	validationutils "github.com/tmlmobilidade/go/packages-golang/validator/src/validations/utils"
	"main/types"
)

func FilePresenceAndIntegrity(v *validationutils.Findings, gtfs types.Gtfs, rules *types.GtfsRules) {
	forbiddenFiles := services.NewRulesParser(services.AppCLI.Options.RulesPath).GetForbiddenFiles(rules)

	for _, file := range forbiddenFiles {
		tableName := file[:len(file)-4]
		if gtfs.HasTable(tableName) {
			v.AddError(file, fmt.Sprintf(i18n.AppTranslator.Get("file_validation_gtfs_feed_file_presence_and_integrity_rule.forbidden"), file), types.SEVERITY_ERROR)
		}
	}

	checkForbiddenNetworks(v, gtfs, rules)
}

func checkForbiddenNetworks(v *validationutils.Findings, gtfs types.Gtfs, rules *types.GtfsRules) {
	severity := types.SEVERITY_ERROR
	if rules != nil {
		severity = rules.Rule("file_validation_gtfs_feed_file_presence_and_integrity_rule").Severity
	}
	routeCount, err := gtfs.GetTableCount("routes")
	if err != nil || routeCount == 0 {
		return
	}

	_ = gtfs.IterateRoutes(func(_ int, route types.RouteRaw) error {
		if route.NetworkId != "" {
			networkCount, _ := gtfs.GetTableCount("networks")
			if networkCount > 0 {
				v.AddError("networks.txt", i18n.AppTranslator.Get("file_validation_gtfs_feed_file_presence_and_integrity_rule.networks_forbidden_when_network_id"), severity)
			}
			routeNetworkCount, _ := gtfs.GetTableCount("route_networks")
			if routeNetworkCount > 0 {
				v.AddError("route_networks.txt", i18n.AppTranslator.Get("file_validation_gtfs_feed_file_presence_and_integrity_rule.route_networks_forbidden_when_network_id"), severity)
			}
			return fmt.Errorf("found network_id") // Signal to stop iteration
		}
		return nil
	})
}
