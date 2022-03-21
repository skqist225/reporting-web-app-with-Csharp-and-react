using DevExpress.DataAccess.Sql;
using DevExpress.XtraReports.UI;
using System;
using System.Collections;
using System.ComponentModel;
using System.Drawing;

namespace WebApplication1.Reports
{
    public partial class XtraReport1 : DevExpress.XtraReports.UI.XtraReport
    {
        public XtraReport1()
        {
            InitializeComponent();
        }

        public XtraReport1(string tableName)
        {

            InitializeComponent();
            this.Bands.Add(new PageHeaderBand());

            SqlDataSource ds = new SqlDataSource("QLVT");
            string queryString = string.Format("SELECT * FROM {0}", tableName);
            SelectQuery query = SelectQueryFluentBuilder
                      .AddTable("dbo.Vattu")
                      .SelectAllColumns()
                      .Build("Vattu");
            ds.Queries.Add(query);
            ds.RebuildResultSchema();
            ds.Fill();

            int rowCount = ((IList)ds.Result[tableName]).Count;
            XRLabel label = new XRLabel();
            label.Width = 500;
            label.Font = new System.Drawing.Font("Verdana", 10F, FontStyle.Bold);
            this.Bands[BandKind.PageHeader].Controls.Add(label);
            if (rowCount > 0)
            {
                int padding = 10;
                int tableWidth = this.PageWidth - this.Margins.Left - this.Margins.Right - padding * 2;

                XRTable dynamicTable = XRTable.CreateTable(
                                    new Rectangle(padding,    // rect X
                                                    2,          // rect Y
                                                    tableWidth, // width
                                                    40),        // height
                                                    1,          // table row count
                                                    0);         // table column count

                dynamicTable.Width = tableWidth;
                dynamicTable.Rows.FirstRow.Width = tableWidth;
                dynamicTable.Borders = DevExpress.XtraPrinting.BorderSide.All;
                dynamicTable.BorderWidth = 1;

                dynamicTable.BeginInit();
                foreach (DevExpress.DataAccess.Sql.DataApi.IColumn dc in ds.Result[tableName].Columns)
                {

                    XRTableCell cell = new XRTableCell();

                    ExpressionBinding binding = new ExpressionBinding("BeforePrint", "Text", dc.Name);
                    cell.ExpressionBindings.Add(binding);
                    cell.CanGrow = false;
                    cell.Width = 100;
                    cell.Text = dc.Name;
                    dynamicTable.Rows.FirstRow.Cells.Add(cell);
                }
                dynamicTable.Font = new System.Drawing.Font("Verdana", 8F);
                dynamicTable.EndInit();
                Detail.Controls.Add(dynamicTable);

                label.Text = string.Format("Data table: {0}", tableName);

                this.DataSource = ds;
                this.DataMember = tableName;
            }
            else
            {
                label.Text = string.Format("There's no data to display or the table doesn't exist.");
            }

        }

       

    }
}
