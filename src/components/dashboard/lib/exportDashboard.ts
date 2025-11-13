'use client';

export const CAPTURE_TARGET_NOT_FOUND = 'CAPTURE_TARGET_NOT_FOUND';

type CaptureResult = {
    dataUrl: string;
    width: number;
    height: number;
};

type ExportOptions = {
    filename?: string;
    filenamePrefix?: string;
};

type FileExtension = 'png' | 'pdf' | 'csv';

// export 파일명 설정
const DEFAULT_PREFIX = 'dashboard';

const buildFileName = (extension: FileExtension, options?: ExportOptions) => {
    if (options?.filename) {
        return options.filename;
    }

    const prefix = options?.filenamePrefix ?? DEFAULT_PREFIX;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}-${timestamp}.${extension}`;
};

// 대시보드 캡쳐
export const captureDashboardImage = async (target: HTMLElement | null): Promise<CaptureResult> => {
    if (!target) {
        throw new Error(CAPTURE_TARGET_NOT_FOUND);
    }

    const { toPng } = await import('html-to-image');

    const width = target.scrollWidth;
    const height = target.scrollHeight;

    const dataUrl = await toPng(target, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width,
        height,
        style: {
            width: `${width}px`,
            height: `${height}px`,
            transform: 'scale(1)',
            transformOrigin: 'top left',
        },
    });

    return { dataUrl, width, height };
};

// 다운로드 PNG
export const downloadDashboardAsPng = async (target: HTMLElement | null, options?: ExportOptions) => {
    const { dataUrl } = await captureDashboardImage(target);

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = buildFileName('png', options);
    link.click();
    link.remove();
};

// 다운로드 PDF
export const downloadDashboardAsPdf = async (target: HTMLElement | null, options?: ExportOptions) => {
    const [{ dataUrl, width, height }, { jsPDF }] = await Promise.all([
        captureDashboardImage(target),
        import('jspdf'),
    ]);

    const orientation = width >= height ? 'landscape' : 'portrait';
    const pdf = new jsPDF({
        orientation,
        unit: 'px',
        format: [width, height],
    });

    pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
    pdf.save(buildFileName('pdf', options));
};

// 다운로드 CSV - 타입과 유틸
type CsvColumn<Row extends Record<string, unknown>> = {
    key: keyof Row | string;
    label: string;
};

const stringifyCell = (value: unknown) => {
    if (value === null || typeof value === 'undefined') {
        return '';
    }

    const stringValue = String(value);
    const needsEscaping = /[",\n]/.test(stringValue);

    if (!needsEscaping) {
        return stringValue;
    }

    return `"${stringValue.replace(/"/g, '""')}"`;
};

type CsvExportOptions = ExportOptions & {
    includeBom?: boolean;
};

// 다운로드 CSV
export const downloadDashboardTableCsv = <Row extends Record<string, unknown>>(
    rows: Row[],
    columns: CsvColumn<Row>[],
    options?: CsvExportOptions,
) => {
    if (typeof document === 'undefined' || !columns.length) {
        return;
    }

    const header = columns.map(({ label }) => stringifyCell(label));
    const body = rows.map((row) =>
        columns.map(({ key }) => {
            const value = (row as Record<string, unknown>)[key as string];
            return stringifyCell(value);
        }),
    );

    const tableRows = [header, ...body];
    const csvContent = tableRows.map((row) => row.join(',')).join('\n');
    const content = (options?.includeBom === false ? '' : '\uFEFF') + csvContent;

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = buildFileName('csv', options);
    link.click();
    URL.revokeObjectURL(url);
};

// export 헬퍼: export 실행과 공통 에러 처리
type ExportErrorOptions = {
    missingTargetMessage?: string;
    genericErrorMessage?: string;
    logLabel?: string;
};

export const runDashboardExport = async (
    task: () => Promise<void>,
    {
        missingTargetMessage = '저장할 대상을 찾을 수 없습니다.',
        genericErrorMessage = '저장 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        logLabel = 'Dashboard export failed',
    }: ExportErrorOptions = {},
) => {
    try {
        await task();
    } catch (error) {
        if (error instanceof Error && error.message === CAPTURE_TARGET_NOT_FOUND) {
            if (typeof window !== 'undefined') {
                window.alert(missingTargetMessage);
            }
            return;
        }

        console.error(logLabel, error);
        if (typeof window !== 'undefined') {
            window.alert(genericErrorMessage);
        }
    }
};
