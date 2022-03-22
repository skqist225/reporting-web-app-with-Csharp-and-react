import React, { useEffect } from 'react';
import ko from 'knockout';
import ListTableName from './components/ListTableName';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTableNames } from './features/databaseSlice';

import 'devexpress-reporting/dx-reportdesigner';
import './App.css';
import { TextareaAutosize } from '@mui/material';
import FieldArray from './components/FileArray';

import MyDraggableComp from './components/MyDraggableComp';
import Helmet from 'react-helmet';
// let LeaderLine = require('LeaderLine');
import LeaderLine from 'leader-line';

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
    const dispatch = useDispatch();
    const { tableNames, tables } = useSelector(state => state.database);

    useEffect(async () => {
        dispatch(fetchTableNames());
    }, []);

    return (
        <main>
            <div className='flex-space'>
                <div id='element-1'>asdfasdf</div>
                <div id='element-2'>asdfsafsad</div>
            </div>
            <div>
                <TextareaAutosize
                    aria-label='minimum height'
                    minRows={5}
                    placeholder='AUTOGENERATED QUERY'
                    style={{
                        width: '100%',
                        fontSize: '16px',
                        border: '2px solid paleblue',
                        borderRadius: '8px',
                    }}
                    readOnly
                />
            </div>
            <div style={{ height: '269px', overflowY: 'scroll' }}>
                <FieldArray />
            </div>
            <div className='normal-flex' style={{ height: '100%' }}>
                <div>{tableNames && <ListTableName tableNames={tableNames} />}</div>
                <article
                    className='flex'
                    style={{
                        boxShadow: 'rgb(0 0 0 / 28%) 0px 8px 28px',
                        height: '500px',
                        width: '100%',
                        border: '1px solid red',
                    }}
                >
                    {/* <Table /> */}

                    <div className='normal-flex'>
                        {tables.map(table => (
                            <MyDraggableComp table={table} key={table.tableName} />
                        ))}
                    </div>
                </article>
            </div>
            <script></script>
            {/* <ReportViewer /> */}
        </main>
    );
}

export default App;
