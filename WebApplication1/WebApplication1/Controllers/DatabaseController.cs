using DevExpress.XtraReports.UI;
using System.Data;
using System.IO;
using System.Web;
using System.Web.Http;
using WebApplication1.Services;

namespace WebApplication1.Controllers
{
    public class DatabaseController : ApiController
    {

        [HttpGet]
        [Route("api/db/all-tables")]
        public DataSet AllTables()
        {
            var query = "select name FROM SYS.tables T WHERE T.is_ms_shipped = 0 AND T.name <> 'sysdiagrams'";
            DataSet ds = new ConnectToDatabase().PerformQuery(query);
            return ds;
        }

        [HttpGet]
        [Route("api/db/table-properties")]
        public DataSet TableColumn(string tableName)
        {
            //string tableName = context.Request.Params["tableName"];
            var query = "SELECT COLUMN_NAME FROM information_schema.columns WHERE table_name = '" + tableName + "'";
            return new ConnectToDatabase().PerformQuery(query);
        }

        [HttpGet]
        [Route("api/db/table-constraints")]
        public DataSet TableConstraints(string tableName)
        {
            var query = "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME = '" + tableName + "' AND CONSTRAINT_TYPE = 'FOREIGN KEY'";
            return new ConnectToDatabase().PerformQuery(query);
        }

        [Route("api/db/open-report")]

        public XtraReport GetDocument()
        {
            var query = "SELECT DSV_WITH_MAX_DIEMHM.MASV , DSV_WITH_MAX_DIEMHM.TENMH AS TENMH, MAX(DSV_WITH_MAX_DIEMHM.DIEMHM) AS DIEMHM  FROM ("
                  + "SELECT DSV.MASV, MH.TENMH, (DSV.DIEM_CC * 0.1 + DSV.DIEM_GK * 0.3 + DSV.DIEM_CK * 0.6) AS DIEMHM FROM LOPTINCHI AS LTC inner join("
                  + "SELECT MASV, MALTC, DIEM_CC, DIEM_GK, DIEM_CK FROM DANGKY WHERE MASV IN (SELECT MASV FROM SINHVIEN WHERE MALOP = N'" + "D15CQCP01" + "') AND HUYDANGKY = 0"
                  + ") AS DSV ON DSV.MALTC = LTC.MALTC left join(SELECT MAMH, TENMH FROM MONHOC) AS MH ON MH.MAMH = LTC.MAMH"
                  + ") AS DSV_WITH_MAX_DIEMHM GROUP BY DSV_WITH_MAX_DIEMHM.TENMH, DSV_WITH_MAX_DIEMHM.MASV";
            XtraReport report = new CustomReportProvider().GetReport2(query);
            using (var ms = new MemoryStream())
            {
                report.ExportToPdf(ms);
                //return File(ms.ToArray(), "application/pdf");
            }
            return report;
        }
    }
}
