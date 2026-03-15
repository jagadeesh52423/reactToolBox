'use client';

import CronParserTool from './components/CronParserTool';

/**
 * Cron Parser Page
 *
 * Interactive cron expression parser and schedule viewer.
 *
 * Features:
 * - Parse and validate 5-field cron expressions
 * - Human-readable description of schedules
 * - Interactive builder with bidirectional sync
 * - Next 10 run times calculator
 * - 10 common presets for quick selection
 */
export default function CronParserPage() {
  return <CronParserTool />;
}
