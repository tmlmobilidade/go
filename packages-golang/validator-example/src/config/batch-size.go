package config

// BatchSize is the number of rows to insert in a single transaction
// Tune this depending on SSD/HDD performance
const BatchSize = 10000