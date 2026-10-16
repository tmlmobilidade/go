package services

import (
	"fmt"
	"io"
	"main/lib"
	ruleset "main/lib/rules"
	"main/types"
	"os"
	"reflect"
)

// RulesParser handles parsing of GTFS validation rules from JSON files
type RulesParser struct {
	rulesPath string
}

// NewRulesParser creates a new rules parser with the specified rules file path
func NewRulesParser(rulesPath string) *RulesParser {
	return &RulesParser{
		rulesPath: rulesPath,
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

// validateRules checks the configured dependency graph in every file section.
func (rp *RulesParser) validateRules(rules *types.GtfsRules) error {
	sections := reflect.ValueOf(rules).Elem()
	for i := range sections.NumField() {
		sectionName := sections.Type().Field(i).Tag.Get("json")
		if err := ruleset.ValidateSection(sections.Field(i).Interface()); err != nil {
			return fmt.Errorf("Invalid depends_on in '%s': %w", sectionName, err)
		}
	}
	return nil
}

// ParseRulesFromFile is a convenience function to parse rules from a file path
func ParseRulesFromFile(rulesPath string) (*types.GtfsRules, error) {
	if rulesPath == "" {
		return nil, nil
	}

	parser := NewRulesParser(rulesPath)
	return parser.ParseRules()
}

func isMetaGtfsRulesSection(jsonTag string) bool {
	return jsonTag == "file_validation"
}

func (rp *RulesParser) GetRequiredFiles(rules *types.GtfsRules) []string {
	if rules == nil {
		return []string{}
	}

	allFiles := lib.GetAllStructTagValues(types.GtfsRules{}, "json")
	requiredFiles := make([]string, 0)

	for _, file := range allFiles {
		if isMetaGtfsRulesSection(file) {
			continue
		}
		// Get the nested struct field value by json tag
		fileValue := rp.getNestedFieldByTag(rules, "json", file)
		if fileValue.IsValid() && fileValue.Kind() == reflect.Struct {
			// Look for _file field in the nested struct
			fileField := rp.getNestedFieldByTag(fileValue.Addr().Interface(), "json", "_file")
			if fileField.IsValid() {
				severity := types.Severity(fileField.String())
				if severity == types.SEVERITY_ERROR {
					// Add .txt extension to match file name format
					requiredFiles = append(requiredFiles, file+".txt")
				}
			}
		}
	}

	return requiredFiles
}

// getNestedFieldByTag gets a field value by tag from a struct (handles nested structs)
func (rp *RulesParser) getNestedFieldByTag(obj interface{}, tagKey, tagValue string) reflect.Value {
	v := reflect.ValueOf(obj)
	if v.Kind() == reflect.Ptr {
		v = v.Elem()
	}

	if v.Kind() != reflect.Struct {
		return reflect.Value{}
	}

	t := v.Type()
	for i := 0; i < v.NumField(); i++ {
		field := v.Field(i)
		fieldType := t.Field(i)
		tag := fieldType.Tag.Get(tagKey)

		if tag == tagValue {
			return field
		}
	}

	return reflect.Value{}
}

func (rp *RulesParser) GetForbiddenFiles(rules *types.GtfsRules) []string {
	if rules == nil {
		return []string{}
	}

	allFiles := lib.GetAllStructTagValues(types.GtfsRules{}, "json")
	forbiddenFiles := make([]string, 0)

	for _, file := range allFiles {
		if isMetaGtfsRulesSection(file) {
			continue
		}
		// Get the nested struct field value by json tag
		fileValue := rp.getNestedFieldByTag(rules, "json", file)
		if fileValue.IsValid() && fileValue.Kind() == reflect.Struct {
			// Look for _file field in the nested struct
			fileField := rp.getNestedFieldByTag(fileValue.Addr().Interface(), "json", "_file")
			if fileField.IsValid() {
				severity := types.Severity(fileField.String())
				if severity == types.SEVERITY_FORBIDDEN {
					// Add .txt extension to match file name format
					forbiddenFiles = append(forbiddenFiles, file+".txt")
				}
			}
		}
	}

	return forbiddenFiles
}

func (rp *RulesParser) GetWarningFiles(rules *types.GtfsRules) []string {
	if rules == nil {
		return []string{}
	}

	allFiles := lib.GetAllStructTagValues(types.GtfsRules{}, "json")
	warningFiles := make([]string, 0)

	for _, file := range allFiles {
		if isMetaGtfsRulesSection(file) {
			continue
		}
		// Get the nested struct field value by json tag
		fileValue := rp.getNestedFieldByTag(rules, "json", file)
		if fileValue.IsValid() && fileValue.Kind() == reflect.Struct {
			// Look for _file field in the nested struct
			fileField := rp.getNestedFieldByTag(fileValue.Addr().Interface(), "json", "_file")
			if fileField.IsValid() {
				severity := types.Severity(fileField.String())
				if severity == types.SEVERITY_WARNING {
					// Add .txt extension to match file name format
					warningFiles = append(warningFiles, file+".txt")
				}
			}
		}
	}

	return warningFiles
}
