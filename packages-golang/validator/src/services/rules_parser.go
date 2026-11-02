package services

import (
	"fmt"
	"github.com/tmlmobilidade/go/packages-golang/validator/src/lib"
	ruleset "github.com/tmlmobilidade/go/packages-golang/validator/src/lib/rules"
	"io"
	"main/types"
	"os"
)

// RulesParser handles parsing of GTFS validation rules from JSON files
type RulesParser struct {
	rulesPath string
	knownIDs  []string
}

// NewRulesParser creates a new rules parser with the specified rules file path
func NewRulesParser(rulesPath string, knownIDs ...string) *RulesParser {
	return &RulesParser{
		rulesPath: rulesPath,
		knownIDs:  knownIDs,
	}
}

// ParseRules reads and parses the rules JSON file into a GtfsRules structure
func (rp *RulesParser) ParseRules() (*types.GtfsRules, error) {
	if rp.rulesPath == "" {
		return nil, nil
	}

	// Check if file exists
	if _, err := os.Stat(rp.rulesPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("rules file does not exist: %s", rp.rulesPath)
	}

	// Open and read the file
	file, err := os.Open(rp.rulesPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open rules file: %w", err)
	}
	defer file.Close()

	data, err := io.ReadAll(file)
	if err != nil {
		return nil, fmt.Errorf("failed to read rules file: %w", err)
	}

	// Parse JSON into GtfsRules structure
	rules, err := ruleset.DecodeConfig(data)
	if err != nil {
		return nil, fmt.Errorf("failed to parse rules JSON: %w", err)
	}

	// Validate the parsed rules
	if err := rp.validateRules(&rules); err != nil {
		return nil, fmt.Errorf("rules validation failed: %w", err)
	}

	lib.AppLogger.Info(fmt.Sprintf("Successfully parsed rules from: %s", rp.rulesPath))
	return &rules, nil
}

// validateRules checks the complete dependency graph, independent of data sources.
func (rp *RulesParser) validateRules(config *types.GtfsRules) error {
	return ruleset.ValidateDependencies(config, rp.knownIDs...)
}

// ParseRulesFromFile is a convenience function to parse rules from a file path
func ParseRulesFromFile(rulesPath string) (*types.GtfsRules, error) {
	if rulesPath == "" {
		return nil, nil
	}

	parser := NewRulesParser(rulesPath)
	return parser.ParseRules()
}

func (rp *RulesParser) GetRequiredFiles(rules *types.GtfsRules) []string {
	return rp.getFilesBySeverity(rules, types.SEVERITY_ERROR)
}

func (rp *RulesParser) GetForbiddenFiles(rules *types.GtfsRules) []string {
	return rp.getFilesBySeverity(rules, types.SEVERITY_FORBIDDEN)
}

func (rp *RulesParser) GetWarningFiles(rules *types.GtfsRules) []string {
	return rp.getFilesBySeverity(rules, types.SEVERITY_WARNING)
}

func (rp *RulesParser) GetInfoFiles(rules *types.GtfsRules) []string {
	return rp.getFilesBySeverity(rules, types.SEVERITY_INFO)
}

func (rp *RulesParser) getFilesBySeverity(config *types.GtfsRules, wanted types.Severity) []string {
	files := []string{}
	for _, file := range types.GtfsRuleFiles {
		if ruleset.FileSeverity(config, file) == wanted {
			files = append(files, file+".txt")
		}
	}
	return files
}
