package file_validation

import (
	"fmt"
	"main/i18n"
	"main/lib"
	ruleset "main/lib/rules"
	"main/services"
	"main/types"
	"strings"
)

type FileValidation struct {
	*types.Validation
	missingFiles map[string]bool
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
	v.missingFiles = make(map[string]bool)

	v.checkForbiddenFiles(gtfs, rules)
	v.checkWarningFiles(gtfs, rules)
	v.checkRequiredFiles(gtfs, rules)
	v.checkStopsConditional(gtfs, rules)
	v.checkCalendarFiles(gtfs, rules)
	v.checkLevelsIfElevator(gtfs, rules)
	v.checkFeedInfoWithTranslations(gtfs, rules)
	v.checkForbiddenNetworks(gtfs, rules)

	return services.AppMessageService.TotalErrors() > initialErrors
}

func (v *FileValidation) addError(file, msg string, severity types.Severity) {
	if severity == "" || severity == types.SEVERITY_IGNORE {
		return
	}
	if severity == types.SEVERITY_FORBIDDEN {
		severity = types.SEVERITY_ERROR
	}
	services.AppMessageService.AddMessage(types.Message{
		Field:    "N/A",
		Rows:     []int{},
		FileName: file,
		Message:  msg,
		Severity: severity,
		RuleID:   types.RuleIDGtfsFeedFilePresenceAndIntegrity,
	})
}

// Missing files have a stable rule ID per file, regardless of required/recommended severity.
func (v *FileValidation) addMissingFile(file, msg string, severity types.Severity) {
	if severity != types.SEVERITY_ERROR && severity != types.SEVERITY_WARNING {
		return
	}
	if v.missingFiles == nil {
		v.missingFiles = make(map[string]bool)
	}
	if v.missingFiles[file] {
		return
	}
	v.missingFiles[file] = true
	services.AppMessageService.AddMessage(types.Message{
		Field:    "N/A",
		Rows:     []int{},
		FileName: file,
		Message:  msg,
		Severity: severity,
		RuleID:   strings.TrimSuffix(file, ".txt") + "_file_missing",
	})
}

func (v *FileValidation) checkForbiddenFiles(gtfs types.Gtfs, rules *types.GtfsRules) {
	forbiddenFiles := services.NewRulesParser(services.AppCLI.Options.RulesPath).GetForbiddenFiles(rules)

	for _, file := range forbiddenFiles {
		tableName := file[:len(file)-4]
		if gtfs.HasTable(tableName) {
			v.addError(file, fmt.Sprintf(i18n.AppTranslator.Get("file_validations.forbidden"), file), types.SEVERITY_ERROR)
		}
	}
}

func (v *FileValidation) checkWarningFiles(gtfs types.Gtfs, rules *types.GtfsRules) {
	warningFromRules := services.NewRulesParser(services.AppCLI.Options.RulesPath).GetWarningFiles(rules)

	for _, file := range warningFromRules {
		tableName := file[:len(file)-4]
		if !gtfs.HasTable(tableName) {
			v.addMissingFile(file, fmt.Sprintf(i18n.AppTranslator.Get("file_validations.warning"), file), types.SEVERITY_WARNING)
		}
	}
}

func (v *FileValidation) checkRequiredFiles(gtfs types.Gtfs, rules *types.GtfsRules) {
	minRequired := []string{}
	if rules == nil {
		minRequired = []string{"agency.txt", "routes.txt", "trips.txt", "stop_times.txt"}
	}
	requiredFromRules := services.NewRulesParser(services.AppCLI.Options.RulesPath).GetRequiredFiles(rules)

	mergedRequired := lib.RemoveDuplicates(append(minRequired, requiredFromRules...))

	for _, file := range mergedRequired {
		tableName := file[:len(file)-4]
		if !gtfs.HasTable(tableName) {
			v.addMissingFile(file, fmt.Sprintf(i18n.AppTranslator.Get("file_validations.required"), file), types.SEVERITY_ERROR)
		}
	}
}

func (v *FileValidation) checkStopsConditional(gtfs types.Gtfs, rules *types.GtfsRules) {
	if !gtfs.HasTable("locations") {
		if !gtfs.HasTable("stops") {
			v.addMissingFile("stops.txt", i18n.AppTranslator.Get("file_validations.stops_required_when_locations_missing"), conditionalSeverity(rules, "stops"))
		}
	}
}

func (v *FileValidation) checkCalendarFiles(gtfs types.Gtfs, rules *types.GtfsRules) {
	hasCalendar := gtfs.HasTable("calendar")
	hasDates := gtfs.HasTable("calendar_dates")

	if !hasCalendar && !hasDates {
		v.addMissingFile("calendar.txt", i18n.AppTranslator.Get("file_validations.calendar_files_required"), conditionalSeverity(rules, "calendar"))
		if rules != nil {
			v.addMissingFile("calendar_dates.txt", i18n.AppTranslator.Get("file_validations.calendar_files_required"), conditionalSeverity(rules, "calendar_dates"))
		}
	}
}

func (v *FileValidation) checkLevelsIfElevator(gtfs types.Gtfs, rules *types.GtfsRules) {
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
		v.addMissingFile("levels.txt", i18n.AppTranslator.Get("file_validations.levels_required_when_elevator"), conditionalSeverity(rules, "levels"))
	}
}

func (v *FileValidation) checkFeedInfoWithTranslations(gtfs types.Gtfs, rules *types.GtfsRules) {
	translationCount, err := gtfs.GetTableCount("translations")
	if err != nil || translationCount == 0 {
		return
	}
	feedInfoCount, err := gtfs.GetTableCount("feed_info")
	if err != nil || feedInfoCount == 0 {
		v.addMissingFile("feed_info.txt", i18n.AppTranslator.Get("file_validations.feed_info_required_when_translations"), conditionalSeverity(rules, "feed_info"))
	}
}

func (v *FileValidation) checkForbiddenNetworks(gtfs types.Gtfs, rules *types.GtfsRules) {
	severity := types.SEVERITY_ERROR
	if rules != nil {
		severity = rules.FileValidation.GtfsFeedFilePresenceAndIntegrity.Severity
	}
	routeCount, err := gtfs.GetTableCount("routes")
	if err != nil || routeCount == 0 {
		return
	}

	_ = gtfs.IterateRoutes(func(_ int, route types.RouteRaw) error {
		if route.NetworkId != "" {
			networkCount, _ := gtfs.GetTableCount("networks")
			if networkCount > 0 {
				v.addError("networks.txt", i18n.AppTranslator.Get("file_validations.networks_forbidden_when_network_id"), severity)
			}
			routeNetworkCount, _ := gtfs.GetTableCount("route_networks")
			if routeNetworkCount > 0 {
				v.addError("route_networks.txt", i18n.AppTranslator.Get("file_validations.route_networks_forbidden_when_network_id"), severity)
			}
			return fmt.Errorf("found network_id") // Signal to stop iteration
		}
		return nil
	})
}

// Standalone validation retains GTFS requirements; an agency configuration owns
// every severity, including ignore for settings absent from older saved data.
func conditionalSeverity(config *types.GtfsRules, group string) types.Severity {
	if config == nil {
		return types.SEVERITY_ERROR
	}
	return ruleset.FileSeverity(config, group)
}
