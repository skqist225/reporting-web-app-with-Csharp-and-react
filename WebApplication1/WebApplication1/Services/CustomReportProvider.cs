using System;
using System.Collections;
using DevExpress.DataAccess.Sql;
using DevExpress.XtraReports.Services;
using DevExpress.XtraReports.UI;
using System.Drawing;
using System.Collections.Generic;

namespace WebApplication1.Services
{
    public class CustomReportProvider : IReportProvider
    {

        public XtraReport GetReport(string id, ReportProviderContext context)
        {
            var defaultQuery = "SELECT DSV_WITH_MAX_DIEMHM.MASV , DSV_WITH_MAX_DIEMHM.TENMH AS TENMH, MAX(DSV_WITH_MAX_DIEMHM.DIEMHM) AS DIEMHM  FROM ("
                    + "SELECT DSV.MASV, MH.TENMH, (DSV.DIEM_CC * 0.1 + DSV.DIEM_GK * 0.3 + DSV.DIEM_CK * 0.6) AS DIEMHM FROM LOPTINCHI AS LTC inner join("
                    + "SELECT MASV, MALTC, DIEM_CC, DIEM_GK, DIEM_CK FROM DANGKY WHERE MASV IN (SELECT MASV FROM SINHVIEN WHERE MALOP = N'" + "D15CQCP01" + "') AND HUYDANGKY = 0"
                    + ") AS DSV ON DSV.MALTC = LTC.MALTC left join(SELECT MAMH, TENMH FROM MONHOC) AS MH ON MH.MAMH = LTC.MAMH"
                    + ") AS DSV_WITH_MAX_DIEMHM GROUP BY DSV_WITH_MAX_DIEMHM.TENMH, DSV_WITH_MAX_DIEMHM.MASV";

            string[] parts = id.Split('?');
            var tableName = parts[0];
            var queryFromClient = parts.Length > 1 ? parts[1].Split('=')[1] : String.Empty;

            SqlDataSource sqlDataSource = new ConnectToDatabase().CreateSQLDataSource(tableName, queryFromClient != null ? queryFromClient : defaultQuery);

            // Creates a new report and assigns the data source.
            XtraReport report = new XtraReport();
            report.DataSource = sqlDataSource;
            report.DataMember = tableName;

            addTablesToReport(report, sqlDataSource);
            return report;
        }

        private static void Table_BeforePrint(object sender, System.Drawing.Printing.PrintEventArgs e)
        {
            XtraReport report = (sender as XRTable).RootReport;
            (sender as XRTable).WidthF = report.PageWidth - report.Margins.Left - report.Margins.Right;
        }


        private static void addTablesToReport(XtraReport report, SqlDataSource ds)
        {
            float tableSize = report.PageWidth - report.Margins.Left -report.Margins.Right;
            List<string> fields = new List<string>();

            int rowCount = ((IList)ds.Result["QLDSV_HTC"]).Count;

            PageHeaderBand pageHeaderBand = new PageHeaderBand();

            if (rowCount > 0)
            {
                XRTableRow tableRow = new XRTableRow();
                foreach (DevExpress.DataAccess.Sql.DataApi.IColumn dc in ds.Result["QLDSV_HTC"].Columns)
                {
                    fields.Add(dc.Name);

                }
                XRTable headerTable = GetHeaderTable(fields, tableSize);
                XRTable table = GetTableBoundData(fields, tableSize);

                DetailBand detailBand = new DetailBand();


                pageHeaderBand.Controls.Add(headerTable);
                detailBand.Controls.Add(table);
                report.Bands.Add(detailBand);


                detailBand.HeightF = table.HeightF;
                pageHeaderBand.HeightF = headerTable.HeightF;
            } else
            {
                XRLabel label = new XRLabel();
                label.Width = 500;
                label.Font = new System.Drawing.Font("Verdana", 30F, FontStyle.Bold);
                label.Text = string.Format("There's no data to display or the table doesn't exist.");
                report.Bands[BandKind.PageHeader].Controls.Add(label);
            }

            report.Bands.Add(pageHeaderBand);
        }

        private static XRTable GetHeaderTable(List<string> fields, float tableSize)
        {
            XRTable table = new XRTable();
            table.BeginInit();

            table.LocationF = new DevExpress.Utils.PointFloat(0F, 0F);
            table.Borders = DevExpress.XtraPrinting.BorderSide.All;

            XRTableRow tableRow = new XRTableRow();
            float cellSize = tableSize / fields.Count;

            foreach(string field in fields)
            {
                XRTableCell cell = new XRTableCell()
                {
                    Text = field,
                    WidthF = cellSize,
                    BackColor = System.Drawing.Color.LightSkyBlue
                };
                tableRow.Cells.Add(cell);
            }
            tableRow.HeightF = 30F;
            tableRow.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            table.Rows.Add(tableRow);
            table.AdjustSize();
            table.EndInit();
            return table;
        }

        private static XRTable GetTableBoundData(List<string> fields, float tableSize)
        {
            var table = new XRTable();
            table.BeginInit();
            table.LocationF = new DevExpress.Utils.PointFloat(0F, 0F);
            table.Borders = DevExpress.XtraPrinting.BorderSide.Left
                | DevExpress.XtraPrinting.BorderSide.Right
                | DevExpress.XtraPrinting.BorderSide.Bottom;


            float rowHeight = 20f;
            XRTableRow row = new XRTableRow();
            foreach(var field in fields)
            {
                var cell = new XRTableCell()
                {
                    Text=field,
                    WidthF= tableSize / fields.Count,
                    CanGrow = true,
                };
                cell.ExpressionBindings.Add(new ExpressionBinding("BeforePrint", "Text", field));
                row.Cells.Add(cell);
            }

            row.HeightF = rowHeight;
            row.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            table.Rows.Add(row);

            table.Font = new System.Drawing.Font("Verdana", 12F);
            table.BeforePrint += Table_BeforePrint;
            table.AdjustSize();
            table.EndInit();

            return table;
        }
    }
}