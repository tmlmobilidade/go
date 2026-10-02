// rules-catalogue writes the shared TypeScript rule contract derived from the
// Go rule structs and catalogue. Use `npm run repo:validator-rules` from the
// repository root, which writes the files to
// packages-new/types/gtfs-validator/src/rules/.
package main

import (
	"flag"
	"fmt"
	"main/lib/rules"
	"os"
	"path/filepath"
	"sort"
)

func main() {
	outputDir := flag.String("output-dir", "", "directory for the TypeScript rule files")
	flag.Parse()
	if *outputDir == "" {
		fmt.Fprintln(os.Stderr, "rules-catalogue: --output-dir is required")
		os.Exit(1)
	}
	output, err := rules.TypeScript()
	if err != nil {
		fmt.Fprintln(os.Stderr, "rules-catalogue:", err)
		os.Exit(1)
	}
	if err := os.MkdirAll(*outputDir, 0755); err != nil {
		fmt.Fprintln(os.Stderr, "rules-catalogue:", err)
		os.Exit(1)
	}
	names := make([]string, 0, len(output))
	for name := range output {
		names = append(names, name)
	}
	sort.Strings(names)
	for _, name := range names {
		if err := os.WriteFile(filepath.Join(*outputDir, name), output[name], 0644); err != nil {
			fmt.Fprintln(os.Stderr, "rules-catalogue:", err)
			os.Exit(1)
		}
	}
}
