'use client';

export const CAPTURE_TARGET_NOT_FOUND = 'CAPTURE_TARGET_NOT_FOUND';

type CaptureResult = {
    dataUrl: string;
    width: number;
    height: number;
};

type CaptureOptions = {
    pixelRatio?: number;
    backgroundColor?: string;
    style?: Partial<CSSStyleDeclaration>;
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

// 다운로드 trigger
const triggerDownload = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    link.remove();
};

// 대시보드 캡쳐
export const captureDashboardImage = async (target: HTMLElement | null, options?: CaptureOptions): Promise<CaptureResult> => {
    if (!target) {
        throw new Error(CAPTURE_TARGET_NOT_FOUND);
    }

    const { toPng } = await import('html-to-image');

    const width = target.scrollWidth;
    const height = target.scrollHeight;
    const {
        pixelRatio = 2,
        backgroundColor = '#ffffff',
        style,
    } = options ?? {};

    const dataUrl = await toPng(target, {
        cacheBust: true,
        pixelRatio,
        backgroundColor,
        width,
        height,
        style: {
            margin: '0',
            width: `${width}px`,
            height: `${height}px`,
            transform: 'scale(1)',
            transformOrigin: 'top left',
            ...style,
        },
    });

    return { dataUrl, width, height };
};

// 다운로드 PNG
type VisualExportOptions = ExportOptions & {
    captureOptions?: CaptureOptions;
};

export const downloadDashboardAsPng = async (target: HTMLElement | null, options?: VisualExportOptions) => {
    const { dataUrl } = await captureDashboardImage(target, options?.captureOptions);

    triggerDownload(dataUrl, buildFileName('png', options));
};

// 다운로드 PDF
export const downloadDashboardAsPdf = async (target: HTMLElement | null, options?: VisualExportOptions) => {
    const [{ dataUrl, width, height }, { jsPDF }] = await Promise.all([
        captureDashboardImage(target, options?.captureOptions),
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
    key?: keyof Row | string;
    label: string;
    accessor?: (row: Row) => unknown;
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
        columns.map(({ key, accessor }) => {
            if (typeof accessor === 'function') {
                return stringifyCell(accessor(row));
            }

            if (key) {
                const value = (row as Record<string, unknown>)[key as string];
                return stringifyCell(value);
            }

            return '';
        }),
    );

    const tableRows = [header, ...body];
    const csvContent = tableRows.map((row) => row.join(',')).join('\n');
    const content = (options?.includeBom === false ? '' : '\uFEFF') + csvContent;

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    try {
        triggerDownload(url, buildFileName('csv', options));
    } finally {
        URL.revokeObjectURL(url);
    }
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
    if (typeof window === 'undefined') {
        return;
    }

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
