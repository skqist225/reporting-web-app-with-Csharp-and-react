import React, { useEffect } from 'react';
import ko from 'knockout';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

function ReportPage() {
    const [search] = useSearchParams();

    useEffect(() => {
        ko.applyBindings(
            {
                reportUrl: ko.observable(
                    `QLDSV_HTC?query=${
                        search.get('query') ? search.get('query') : 'SELECT * FROM SINHVIEN'
                    }`
                ),
                requestOptions: {
                    host: 'https://localhost:44322/',
                    invokeAction: '/WebDocumentViewer/Invoke',
                },
            },
            document.querySelector('#documentViewerContainer')
        );

        return () => ko.cleanNode(document.querySelector('#documentViewerContainer'));
    }, []);

    return (
        <div style={{ width: '100%', height: '100vh' }}>
            <div id='documentViewerContainer' data-bind='dxReportViewer: $data'></div>
        </div>
    );
}

export default ReportPage;
