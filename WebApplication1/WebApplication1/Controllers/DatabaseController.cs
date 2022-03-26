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
            return new ConnectToDatabase().PerformQuery("EXEC GET_TABLE_INFO @tableName=N'" + tableName +"'");
        }

        [HttpGet]
        [Route("api/db/table-constraints")]
        public DataSet TableConstraints(string tableName)
        {
            var query = "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS WHERE TABLE_NAME = '" + tableName + "' AND CONSTRAINT_TYPE = 'FOREIGN KEY'";
            return new ConnectToDatabase().PerformQuery(query);
        }

        [HttpGet]
        [Route("api/db/is-valid-query")]
        public string isValidQuery(string query)
        {
            return new ConnectToDatabase().PerformQuery(query.Replace("EQUAL", "=")) == null ? "invalid" : "valid";
        }
    }
}
