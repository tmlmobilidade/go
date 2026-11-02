// rules-ids writes the TypeScript rule IDs discovered in the Go validation implementations.
// Use `npm run repo:validator-rules` from the repository root to generate
// packages-new/types/gtfs-validator/src/rules/rule-ids.ts.
package main

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
)

func main() {
	//

	//
	// A. Read the flags
	
	outputDir := flag.String("output-dir", "", "directory for the generated rule-ids.ts file")
	flag.Parse()
	if *outputDir == "" {
		fmt.Fprintln(os.Stderr, "rules-ids: --output-dir is required")
		os.Exit(1)
	}

	//
	// B. Generate the rule IDs

	output, err := rules.TypeScript()
	if err != nil {
		fmt.Fprintln(os.Stderr, "rules-ids:", err)
		os.Exit(1)
	}

	//
	// C. Write the rule IDs to the output directory

	if err := os.MkdirAll(*outputDir, 0755); err != nil {
		fmt.Fprintln(os.Stderr, "rules-ids:", err)
		os.Exit(1)
	}

	if err := os.WriteFile(filepath.Join(*outputDir, "rule-ids.ts"), output["rule-ids.ts"], 0644); err != nil {
		fmt.Fprintln(os.Stderr, "rules-ids:", err)
		os.Exit(1)
	}
}
