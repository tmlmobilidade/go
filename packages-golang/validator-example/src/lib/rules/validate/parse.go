package validate

import "github.com/tmlmobilidade/go/packages-golang/validator-example/src/types/rules"

// Parse runs the configuration validation steps on JSON bytes. It returns settings
// only; building and executing the rule graph belongs to the algorithm package.
func Parse(data []byte, known map[string]bool) (map[string]rules.RuleConfig, error) {
	//

	//
	// 1. Validate JSON syntax

	if err := ValidateJSON(data); err != nil {
		return nil, err
	}

	//
	// 2. Validate the configuration structure and decode each rule

	config, err := ValidateStructure(data)
	if err != nil {
		return nil, err
	}

	//
	// 3. Validate supported severity values

	if err := ValidateSeverities(config); err != nil {
		return nil, err
	}

	//
	// 4. Validate that every configured rule ID exists in the source

	if err := ValidateRuleIDs(config, known); err != nil {
		return nil, err
	}

	//
	// 5. Validate dependency references

	if err := ValidateDependencies(config, known); err != nil {
		return nil, err
	}

	//
	// 6. Validate that dependencies contain no cycles

	if err := ValidateCycles(config); err != nil {
		return nil, err
	}
	return config, nil
}
