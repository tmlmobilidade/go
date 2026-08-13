package file_validation

import (
	"fmt"
	"main/i18n"
	"main/lib"
	"main/services"
	"main/types"
)

type FileValidation struct {
	*types.Validation
}

func NewFileValidation() *FileValidation {
	return &FileValidation{
		Validation: &types.Validation{
			ID:          "file_validation",
			Description: "Validate file data",
		},
	}
}

// Validate runs all file validations and adds messages directly to AppMessageService.
// Returns true if there are any errors (not warnings).
func (v *FileValidation) Validate(gtfs types.Gtfs, rules *types.GtfsRules) bool {
	initialErrors := services.AppMessageService.TotalErrors()

	v.checkForbiddenFiles(gtfs, rules)
	v.checkWarningFiles(gtfs, rules)
	v.checkRequiredFiles(gtfs, rules)
	v.checkStopsConditional(gtfs)
	v.checkCalendarFiles(gtfs)
	v.checkLevelsIfElevator(gtfs)
	v.checkFeedInfoWithTranslations(gtfs)
	v.checkForbiddenNetworks(gtfs)

	return services.AppMessageService.TotalErrors() > initialErrors
}

func (v *FileValidation) addError(file, msg string) {
	services.AppMessageService.AddMessage(types.Message{
		Field:    "N/A",
		Rows:     []int{},
		FileName: file,
		Message:  msg,
		Severity: types.SEVERITY_ERROR,
		RuleID:   types.RuleIDGtfsFeedFilePresenceAndIntegrity,
	})
}

func (v *FileValidation) addWarning(file, msg string) {
	services.AppMessageService.AddMessage(types.Message{
		Field:    "N/A",
		Rows:     []int{},
		FileName: file,
		Message:  msg,
		Severity: types.SEVERITY_WARNING,
		RuleID:   types.RuleIDGtfsFeedFilePresenceAndIntegrity,
	})
}

func (v *FileValidation) checkForbiddenFiles(gtfs types.Gtfs, rules *types.GtfsRules) {
	forbiddenFiles := services.NewRulesParser(services.AppCLI.Options.RulesPath).GetForbiddenFiles(rules)

	for _, file := range forbiddenFiles {
		tableName := file[:len(file)-4]
		if gtfs.HasTable(tableName) {
			v.addError(file, fmt.Sprintf(i18n.AppTranslator.Get("file_validations.forbidden"), file))
		}
	}
}

func (v *FileValidation) checkWarningFiles(gtfs types.Gtfs, rules *types.GtfsRules) {
	warningFromRules := services.NewRulesParser(services.AppCLI.Options.RulesPath).GetWarningFiles(rules)

	for _, file := range warningFromRules {
		tableName := file[:len(file)-4]
		if !gtfs.HasTable(tableName) {
			v.addWarning(file, fmt.Sprintf(i18n.AppTranslator.Get("file_validations.warning"), file))
		}
	}
}

func (v *FileValidation) checkRequiredFiles(gtfs types.Gtfs, rules *types.GtfsRules) {
	minRequired := []string{"agency.txt", "routes.txt", "trips.txt", "stop_times.txt"}
	requiredFromRules := services.NewRulesParser(services.AppCLI.Options.RulesPath).GetRequiredFiles(rules)

	mergedRequired := lib.RemoveDuplicates(append(minRequired, requiredFromRules...))

	for _, file := range mergedRequired {
		tableName := file[:len(file)-4]
		if !gtfs.HasTable(tableName) {
			v.addError(file, fmt.Sprintf(i18n.AppTranslator.Get("file_validations.required"), file))
		}
	}
}

func (v *FileValidation) checkStopsConditional(gtfs types.Gtfs) {
	if !gtfs.HasTable("locations") {
		if !gtfs.HasTable("stops") {
			v.addError("stops.txt", i18n.AppTranslator.Get("file_validations.stops_required_when_locations_missing"))
		}
	}
}

func (v *FileValidation) checkCalendarFiles(gtfs types.Gtfs) {
	hasCalendar := gtfs.HasTable("calendar")
	hasDates := gtfs.HasTable("calendar_dates")

	if !hasCalendar && !hasDates {
		v.addError("calendar.txt", i18n.AppTranslator.Get("file_validations.calendar_files_required"))
	}
}

func (v *FileValidation) checkLevelsIfElevator(gtfs types.Gtfs) {
	pathwayCount, err := gtfs.GetTableCount("pathways")
	if err != nil || pathwayCount == 0 {
		return
	}

	err = gtfs.IteratePathways(func(_ int, pathway types.PathwaysRaw) error {
		if pathway.PathwayMode == "5" {
			if !gtfs.HasTable("levels") {
				return fmt.Errorf("levels required")
			}
		}
		return nil
	})
	if err != nil && err.Error() == "levels required" {
		v.addError("levels.txt", i18n.AppTranslator.Get("file_validations.levels_required_when_elevator"))
	}
}

func (v *FileValidation) checkFeedInfoWithTranslations(gtfs types.Gtfs) {
	translationCount, err := gtfs.GetTableCount("translations")
	if err != nil || translationCount == 0 {
		return
	}
	feedInfoCount, err := gtfs.GetTableCount("feed_info")
	if err != nil || feedInfoCount == 0 {
		v.addError("feed_info.txt", i18n.AppTranslator.Get("file_validations.feed_info_required_when_translations"))
	}
}

func (v *FileValidation) checkForbiddenNetworks(gtfs types.Gtfs) {
	routeCount, err := gtfs.GetTableCount("routes")
	if err != nil || routeCount == 0 {
		return
	}

	_ = gtfs.IterateRoutes(func(_ int, route types.RouteRaw) error {
		if route.NetworkId != "" {
			networkCount, _ := gtfs.GetTableCount("networks")
			if networkCount > 0 {
				v.addError("networks.txt", i18n.AppTranslator.Get("file_validations.networks_forbidden_when_network_id"))
			}
			routeNetworkCount, _ := gtfs.GetTableCount("route_networks")
			if routeNetworkCount > 0 {
				v.addError("route_networks.txt", i18n.AppTranslator.Get("file_validations.route_networks_forbidden_when_network_id"))
			}
			return fmt.Errorf("found network_id") // Signal to stop iteration
		}
		return nil
	})
}
