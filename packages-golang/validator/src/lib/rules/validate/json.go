package validate

import (
	"encoding/json"
	"fmt"
)

// ValidateJSON checks syntax before any rule configuration is interpreted.
func ValidateJSON(data []byte) error {
	//

	//
	// 1. Reject malformed, empty, or multiple JSON documents

	var document json.RawMessage
	if err := json.Unmarshal(data, &document); err != nil {
		return fmt.Errorf("invalid rules JSON: %w", err)
	}

	//
	// 2. Return nil if the JSON is valid

	return nil
}
