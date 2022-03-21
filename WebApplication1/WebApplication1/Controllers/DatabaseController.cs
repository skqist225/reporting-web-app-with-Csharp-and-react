using Microsoft.AspNetCore.Cors;
using System.Data;
using System.Web;
using System.Web.Http;
using WebApplication1.Services;

namespace WebApplication1.Controllers
{
    [EnableCors("*")]
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
    }
}
