import React, { useEffect } from 'react';
import ko from 'knockout';
import 'devexpress-reporting/dx-reportdesigner';
import './App.css';
import axios from 'axios';

class ReportViewer extends React.Component {
    constructor(props) {
        super(props);
        this.reportUrl = ko.observable(`QLDSV_HTC?query=SELECT * FROM SINHVIEN`);
        this.requestOptions = {
            host: 'https://localhost:44322/',
            invokeAction: '/WebDocumentViewer/Invoke',
        };
    }
    render() {
        return <div id='documentViewerContainer' data-bind='dxReportViewer: $data'></div>;
    }
    componentDidMount() {
        ko.applyBindings(
            {
                reportUrl: this.reportUrl,
                requestOptions: this.requestOptions,
            },
            document.querySelector('#documentViewerContainer')
        );
    }
    componentWillUnmount() {
        ko.cleanNode(document.querySelector('#documentViewerContainer'));
    }
}

function App() {
    useEffect(async () => {
        const { data } = await axios.get('https://localhost:44322/api/db/all-tables');
        console.log(data);
    }, []);

    return (
        <div style={{ width: '100%', height: '1000px' }}>
            <ReportViewer />
        </div>
    );
}

export default App;
