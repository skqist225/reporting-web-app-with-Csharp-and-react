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
            var query = "SELECT PROPERTIES.COLUMN_NAME,CONSTRAINTS.CONSTRAINT_NAME FROM INFORMATION_SCHEMA.COLUMNS PROPERTIES"
                + " LEFT JOIN" 
                + " (SELECT COLUMN_NAME, CONSTRAINT_NAME FROM INFORMATION_SCHEMA.CONSTRAINT_COLUMN_USAGE WHERE table_name ='" + tableName + "' AND CONSTRAINT_NAME NOT LIKE 'UK%') CONSTRAINTS"
                + " ON CONSTRAINTS.COLUMN_NAME =PROPERTIES.COLUMN_NAME WHERE TABLE_NAME = '" + tableName + "' AND PROPERTIES.COLUMN_NAME <> 'rowguid'";
            return new ConnectToDatabase().PerformQuery(query);
        }

        [HttpGet]
        [Route("api/db/table-constraints")]
        public DataSet TableConstraints(string tableName)
        {
            var query = "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME = '" + tableName + "' AND CONSTRAINT_TYPE = 'FOREIGN KEY'";
            return new ConnectToDatabase().PerformQuery(query);
        }
    }
}
