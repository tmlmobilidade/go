package validate

import (
	"fmt"
	"strings"

	"github.com/tmlmobilidade/go/packages-golang/validator/src/types/rules"
)

// ValidateCycles rejects self-dependencies and cycles across configured rules.
func ValidateCycles(config map[string]rules.RuleConfig) error {
	//

	//
	// 1. Visit dependencies, retaining the active path to explain any cycle

	state := make(map[string]uint8, len(config))
	var path []string
	var visit func(string) error
	visit = func(id string) error {
		if state[id] == 2 {
			return nil
		}
		if state[id] == 1 {
			start := 0
			for path[start] != id {
				start++
			}
			cycle := append(append([]string(nil), path[start:]...), id)
			return fmt.Errorf("dependency cycle between rules: %s", strings.Join(cycle, " -> "))
		}
		state[id] = 1
		path = append(path, id)
		for _, dependency := range config[id].DependsOn {
			if err := visit(dependency); err != nil {
				return err
			}
		}
		path = path[:len(path)-1]
		state[id] = 2
		return nil
	}

	//
	// 2. Check every component, including ignored rules and disconnected cycles

	for _, id := range sortedIDs(config) {
		if err := visit(id); err != nil {
			return err
		}
	}
	return nil
}
