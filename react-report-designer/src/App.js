import React, { useEffect } from 'react';
import ko from 'knockout';
import 'devexpress-reporting/dx-reportdesigner';
import './App.css';
import axios from 'axios';

class ReportDesigner extends React.Component {
    constructor(props) {
        super(props);
        this.reportUrl = ko.observable('QLDSV_HTC');
        this.requestOptions = {
            host: 'https://localhost:44322/',
            invokeAction: '/WebDocumentViewer/Invoke',
        };
    }
    render() {
        return <div ref='viewer' data-bind='dxReportViewer: $data'></div>;
    }
    componentDidMount() {
        ko.applyBindings(
            {
                reportUrl: this.reportUrl,
                requestOptions: this.requestOptions,
            },
            this.refs.viewer
        );
    }
    componentWillUnmount() {
        ko.cleanNode(this.refs.viewer);
    }
}

function App() {
    useEffect(async () => {
        const { data } = await axios.get('https://localhost:44322/api/test');
        console.log(data);
    }, []);

    return (
        <div style={{ width: '100%', height: '1000px' }}>
            <ReportDesigner />
        </div>
    );
}

export default App;
