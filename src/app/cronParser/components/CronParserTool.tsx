'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import CronInputPanel from './CronInputPanel';
import CronResultsPanel from './CronResultsPanel';
import {
  parseCronExpression,
  getNextRuns,
  expressionToBuilder,
  builderToExpression,
  detectFieldCount,
  CronFieldCount,
} from '../utils/cronUtils';

export default function CronParserTool() {
    const searchParams = useSearchParams();
    const urlExpr = searchParams.get('expr');

    const [storedExpr, setStoredExpr] = useLocalStorage<string>('reactToolBox_cronParser_expr', '*/5 * * * *');

    const initialExpr = urlExpr || '*/5 * * * *';
    const [expression, setExpressionRaw] = useState(initialExpr);

    // Restore from localStorage when no URL param is present (after hydration)
    useEffect(() => {
        if (!urlExpr && storedExpr && storedExpr !== '*/5 * * * *') {
            setExpressionRaw(storedExpr);
            const detectedCount = detectFieldCount(storedExpr);
            setFieldCount(detectedCount);
            const parsed = expressionToBuilder(storedExpr);
            if (parsed) {
                setBuilderValues(parsed);
            }
        }
    }, [storedExpr, urlExpr]);

    // Wrap setter to also persist to localStorage
    const setExpression = useCallback((value: string) => {
        setExpressionRaw(value);
        setStoredExpr(value);
    }, [setStoredExpr]);
    const [fieldCount, setFieldCount] = useState<CronFieldCount>(() => detectFieldCount(initialExpr));
    const [builderValues, setBuilderValues] = useState(() => {
        return expressionToBuilder(initialExpr) || {
            second: '0',
            minute: '*/5',
            hour: '*',
            dayOfMonth: '*',
            month: '*',
            dayOfWeek: '*',
            year: '*',
        };
    });

    const parseResult = useMemo(() => parseCronExpression(expression), [expression]);
    const nextRuns = useMemo(() => {
        if (!parseResult.isValid) return [];
        return getNextRuns(expression, 10);
    }, [expression, parseResult.isValid]);

    const handleExpressionChange = useCallback((value: string) => {
        setExpression(value);
        const detectedCount = detectFieldCount(value);
        setFieldCount(detectedCount);
        const parsed = expressionToBuilder(value);
        if (parsed) {
            setBuilderValues(parsed);
        }
    }, []);

    const handleBuilderChange = useCallback((field: string, value: string) => {
        setBuilderValues(prev => {
            const updated = { ...prev, [field]: value };
            const newExpression = builderToExpression(updated, fieldCount);
            setExpression(newExpression);
            return updated;
        });
    }, [fieldCount]);

    const handlePresetSelect = useCallback((preset: string) => {
        setExpression(preset);
        const detectedCount = detectFieldCount(preset);
        setFieldCount(detectedCount);
        const parsed = expressionToBuilder(preset);
        if (parsed) {
            setBuilderValues(parsed);
        }
    }, []);

    const handleFieldCountChange = useCallback((newCount: CronFieldCount) => {
        setFieldCount(newCount);
        const newExpr = builderToExpression(builderValues, newCount);
        setExpression(newExpr);
    }, [builderValues]);

    return (
        <div className="h-[var(--tool-content-height)] flex flex-col bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            <main className="flex-1 p-6 overflow-hidden min-h-0">
                <div className="w-full h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                        <CronInputPanel
                            expression={expression}
                            builderValues={builderValues}
                            fieldCount={fieldCount}
                            onExpressionChange={handleExpressionChange}
                            onBuilderChange={handleBuilderChange}
                            onPresetSelect={handlePresetSelect}
                            onFieldCountChange={handleFieldCountChange}
                            error={parseResult.error}
                        />
                        <CronResultsPanel
                            description={parseResult.description}
                            error={parseResult.error}
                            isValid={parseResult.isValid}
                            nextRuns={nextRuns}
                            expression={expression}
                            fieldCount={parseResult.fieldCount}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}
