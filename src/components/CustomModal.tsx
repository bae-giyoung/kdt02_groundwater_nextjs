'use client';

export default function CustomModal({

}) {
  return (
    {/* <div className="donut-modal" role="dialog" aria-modal="true">
        <div className="donut-modal-backdrop" onClick={() => setIsModalOpen(false)} />
        <div className="donut-modal-content">
        <div className="donut-modal-header">
            <CustomButton handler={() => {setIsModalOpen(false);}} caption="닫기" bStyle="donut-modal-close" bType="button" />
        </div>
        <div className="donut-modal-body">
            <div className="flex justify-between items-center gap-2 sm:flex-row flex-col">
                <p className="flex items-start gap-4">
                    <span className="c-stit02">일별 지하수위 현황</span>
                    <CustomButton handler={() => setIsAsc(!isAsc)} caption={isAsc ? '최신순' : '과거순'} bType="button" bStyle="btn-style-5 -mt-0.5" />
                    <CustomButton handler={handleDownloadCSV} caption="csv 다운로드" bType="button" bStyle="btn-style-4 -mt-2" />
                </p>
                <p className="gray-92 text-right">일평균 수위(m), 전일 대비 증감율 (%)</p>
            </div>
            <CustomTable data={sortedTable} columns={tableColumns} />
        </div>
        </div>
    </div> */}
  );
}