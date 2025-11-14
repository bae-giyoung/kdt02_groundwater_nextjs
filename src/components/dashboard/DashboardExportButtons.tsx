'use client';

import { useState, useCallback, RefObject } from 'react';
import CustomButton from '../CustomButton';
import { runDashboardExport, downloadDashboardAsPng, downloadDashboardAsPdf } from './lib/exportDashboard';

type DashboardExportButtonsProps = {
    contentRef: RefObject<HTMLDivElement | null>;
};

export default function DashboardExportButtons({ contentRef }: DashboardExportButtonsProps) {
    const [isExportingPng, setIsExportingPng] = useState<boolean>(false);
    const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);

    const handleSavePng = useCallback(async () => {
        if (isExportingPng) return;
        setIsExportingPng(true);
        try {
            await runDashboardExport(
                () => downloadDashboardAsPng(contentRef.current),
                {
                    logLabel: 'PNG export failed',
                    genericErrorMessage: 'PNG 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                },
            );
        } finally {
            setIsExportingPng(false);
        }
    }, [contentRef, isExportingPng]);

    const handleSavePdf = useCallback(async () => {
        if (isExportingPdf) return;
        setIsExportingPdf(true);
        try {
            await runDashboardExport(
                () => downloadDashboardAsPdf(contentRef.current),
                {
                    logLabel: 'PDF export failed',
                    genericErrorMessage: 'PDF 저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
                },
            );
        } finally {
            setIsExportingPdf(false);
        }
    }, [contentRef, isExportingPdf]);

    const spinner = (
        <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    return (
        <div className="btn-box max-w-1/5 sm:max-w-none shrink-0 flex items-center lg:items-start gap-1 lg:gap-4 flex-col sm:flex-row lg:flex-col">
            <p className="c-stit01 hidden lg:block">다운로드</p>
            <CustomButton
                caption={
                    isExportingPng ? <span className="flex items-center justify-center">{spinner} 저장 중...</span> : "PNG저장"
                }
                bType="button"
                bStyle="btn-style-3 h-full max-h-12 w-full"
                handler={handleSavePng}
                disabled={isExportingPng || isExportingPdf}
            />
            <CustomButton
                caption={
                    isExportingPdf ? <span className="flex items-center justify-center">{spinner} 저장 중...</span> : "PDF저장"
                }
                bType="button"
                bStyle="btn-style-3 h-full max-h-12 w-full"
                handler={handleSavePdf}
                disabled={isExportingPng || isExportingPdf}
            />
        </div>
    );
}
