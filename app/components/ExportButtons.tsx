import React from 'react';

export default function ExportButtons({ data }: { data: any[] }) {
    const exportAsPDF = () => {
        // PDF export işlemi için kod
    };

    const exportAsExcel = () => {
        // Excel export işlemi için kod
    };

    return (
        <div>
            <button onClick={exportAsPDF}>PDF Dışa Aktar</button>
            <button onClick={exportAsExcel}>Excel Dışa Aktar</button>
        </div>
    );
}
