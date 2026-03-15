'use client';

import React, { useState, useCallback, useMemo } from 'react';
import CronInputPanel from './CronInputPanel';
import CronResultsPanel from './CronResultsPanel';
import { parseCronExpression, getNextRuns, expressionToBuilder, builderToExpression } from '../utils/cronUtils';

/**
 * CronParserTool Component
 *
 * Main orchestrator for the Cron Expression Parser tool.
 * Manages expression state and bidirectional sync between
 * the text input and interactive builder.
 */
export default function CronParserTool() {
    const [expression, setExpression] = useState('*/5 * * * *');
    const [builderValues, setBuilderValues] = useState({
        minute: '*/5',
        hour: '*',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*',
    });

    const parseResult = useMemo(() => parseCronExpression(expression), [expression]);
    const nextRuns = useMemo(() => {
        if (!parseResult.isValid) return [];
        return getNextRuns(expression, 10);
    }, [expression, parseResult.isValid]);

    const handleExpressionChange = useCallback((value: string) => {
        setExpression(value);
        const parsed = expressionToBuilder(value);
        if (parsed) {
            setBuilderValues(parsed);
        }
    }, []);

    const handleBuilderChange = useCallback((field: keyof typeof builderValues, value: string) => {
        setBuilderValues(prev => {
            const updated = { ...prev, [field]: value };
            const newExpression = builderToExpression(updated);
            setExpression(newExpression);
            return updated;
        });
    }, []);

    const handlePresetSelect = useCallback((preset: string) => {
        setExpression(preset);
        const parsed = expressionToBuilder(preset);
        if (parsed) {
            setBuilderValues(parsed);
        }
    }, []);

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Main Content */}
            <main className="flex-1 p-6 overflow-hidden min-h-0">
                <div className="w-full h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                        <CronInputPanel
                            expression={expression}
                            builderValues={builderValues}
                            onExpressionChange={handleExpressionChange}
                            onBuilderChange={handleBuilderChange}
                            onPresetSelect={handlePresetSelect}
                            error={parseResult.error}
                        />
                        <CronResultsPanel
                            description={parseResult.description}
                            error={parseResult.error}
                            isValid={parseResult.isValid}
                            nextRuns={nextRuns}
                            expression={expression}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
