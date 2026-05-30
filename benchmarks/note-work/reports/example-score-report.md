# Lumina Note Work Benchmark v0 Example Report

Run output: `runs/baseline-lexical-dev.json`
System: `lexical-baseline@v0.1`
Task set: `dev`
Fixture: `medium-synthetic-v0`

## Summary

- Tasks scored: 80
- High-risk tasks: 54
- Mean task score: 0.816
- High-risk mean score: 0.8354
- Privacy violations: 0
- Forbidden source violations: 0
- Total estimated cost USD: 0

## Per-Family Metrics

| Family | Count | Mean score | Source recall | Privacy score |
| --- | ---: | ---: | ---: | ---: |
| boundary | 10 | 0.88 | 0.9 | 1 |
| find | 14 | 0.8107 | 0.8929 | 1 |
| link | 13 | 0.8435 | 0.7821 | 1 |
| mutate | 13 | 0.7692 | 0.8846 | 1 |
| search_compare | 14 | 0.8682 | 0.8691 | 1 |
| synthesize | 16 | 0.7506 | 0.75 | 1 |

## Evaluation Tiers

deterministic_smoke tasks check harness behavior and deterministic labels.
dev_realistic tasks are the more meaningful note-work slice.

| Tier | Count | Mean score | Source recall | Privacy score |
| --- | ---: | ---: | ---: | ---: |
| deterministic_smoke | 60 | 0.8393 | 0.8583 | 1 |
| dev_realistic | 20 | 0.7462 | 0.7917 | 1 |

## High-Risk Slice

High-risk tasks are reported separately so failures are not hidden by ordinary task averages.

| Bucket | Count | Mean score | Privacy violations | Forbidden source violations |
| --- | ---: | ---: | ---: | ---: |
| boundary | 18 | 0.8867 | 0 | 0 |
| destructive-edit | 3 | 0.9867 | 0 | 0 |
| hallucinated-provenance | 7 | 0.7549 | 0 | 0 |
| long-context | 3 | 0.9533 | 0 | 0 |
| mutation | 21 | 0.8067 | 0 | 0 |
| privacy | 13 | 0.8605 | 0 | 0 |
| stale-source | 21 | 0.8117 | 0 | 0 |

## Dimension Scores

- Source recall: 0.8417
- Source precision: 0.535
- Link recall: 0.9242
- Mutation score: 0.6538
- Privacy score: 1
- Average latency ms: 139.7625
- P95 latency ms: 186

## Failure Categories

- source_precision_loss: 70
- source_miss: 27
- mutation_expected_diff_missing: 10
- boundary_violation: 4
- link_miss: 4

## Reading Notes

This example uses the lexical baseline only. It is a lower-bound comparison for future Lumina or graph-assisted agent runs, not a model leaderboard. Open-ended quality can be reviewed from run output answers, but v0 scoring here uses deterministic source, link, mutation, privacy, cost, and latency evidence.
