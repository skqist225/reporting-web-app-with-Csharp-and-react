using DevExpress.Web.Mvc.Controllers;
using System.Web.Mvc;


namespace WebApplication1.Controllers
{
    public class QueryBuilderController : QueryBuilderApiControllerBase
    {
        // GET: QueryBuilder
        public override ActionResult Invoke()
        {
            var result = base.Invoke();
            // Allow cross-domain requests.
            Response.AppendHeader("Access-Control-Allow-Origin", "*");
            return result;
        }
    }
}