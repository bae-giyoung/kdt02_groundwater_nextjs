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

const DEFAULT_PREFIX = 'dashboard';

const buildFileName = (extension: FileExtension, options?: ExportOptions) => {
    if (options?.filename) {
        return options.filename;
    }

    const prefix = options?.filenamePrefix ?? DEFAULT_PREFIX;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${prefix}-${timestamp}.${extension}`;
};

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

export const downloadDashboardAsPng = async (target: HTMLElement | null, options?: ExportOptions) => {
    const { dataUrl } = await captureDashboardImage(target);

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = buildFileName('png', options);
    link.click();
    link.remove();
};

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
