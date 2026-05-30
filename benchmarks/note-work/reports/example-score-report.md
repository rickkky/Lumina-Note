# Lumina Note Work Benchmark v0 Example Report

Run output: `runs/baseline-lexical-dev.json`
System: `lexical-baseline@v0.1`
Task set: `dev`
Fixture: `medium-synthetic-v0`

## Summary

- Tasks scored: 60
- High-risk tasks: 39
- Mean task score: 0.9508
- High-risk mean score: 0.9454
- Privacy violations: 0
- Forbidden source violations: 0
- Total estimated cost USD: 0

## Per-Family Metrics

| Family | Count | Mean score | Source recall | Privacy score |
| --- | ---: | ---: | ---: | ---: |
| boundary | 8 | 1 | 1 | 1 |
| find | 10 | 1 | 1 | 1 |
| link | 10 | 0.937 | 1 | 1 |
| mutate | 10 | 0.811 | 1 | 1 |
| search_compare | 10 | 1 | 1 | 1 |
| synthesize | 12 | 0.9639 | 0.9444 | 1 |

## High-Risk Slice

High-risk tasks are reported separately so failures are not hidden by ordinary task averages.

| Bucket | Count | Mean score | Privacy violations | Forbidden source violations |
| --- | ---: | ---: | ---: | ---: |
| boundary | 15 | 0.9973 | 0 | 0 |
| destructive-edit | 3 | 1 | 0 | 0 |
| hallucinated-provenance | 7 | 0.8671 | 0 | 0 |
| long-context | 3 | 1 | 0 | 0 |
| mutation | 15 | 0.8713 | 0 | 0 |
| privacy | 10 | 0.996 | 0 | 0 |
| stale-source | 11 | 0.9473 | 0 | 0 |

## Dimension Scores

- Source recall: 0.9889
- Source precision: 0.9667
- Link recall: 0.9792
- Mutation score: 0.685
- Privacy score: 1
- Average latency ms: 38.2
- P95 latency ms: 64

## Failure Categories

- mutation_expected_diff_missing: 7
- source_miss: 2
- source_precision_loss: 2
- link_miss: 1

## Reading Notes

This example uses the lexical baseline only. It is a lower-bound comparison for future Lumina or graph-assisted agent runs, not a model leaderboard. Open-ended quality can be reviewed from run output answers, but v0 scoring here uses deterministic source, link, mutation, privacy, cost, and latency evidence.
