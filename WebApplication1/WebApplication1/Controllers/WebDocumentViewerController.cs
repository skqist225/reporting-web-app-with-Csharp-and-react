using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using DevExpress.Web.Mvc.Controllers;

namespace WebApplication1.Controllers
{
    public class WebDocumentViewerController : WebDocumentViewerApiControllerBase
    {
        // GET: WebDocumentViewer
        [AllowCrossSite]
        public override ActionResult Invoke()
        {
            // CORS preflight request.
            if (this.Request.RequestType == "OPTIONS")
                return new HttpStatusCodeResult(System.Net.HttpStatusCode.OK);
            return base.Invoke();
        }

        public class AllowCrossSiteAttribute : ActionFilterAttribute
        {
            public override void OnActionExecuting(ActionExecutingContext filterContext)
            {
                filterContext.RequestContext.HttpContext.Response.AddHeader("Access-Control-Allow-Origin", "*");
                filterContext.RequestContext.HttpContext.Response.AddHeader("Access-Control-Allow-Headers", "Authorization");
                filterContext.RequestContext.HttpContext.Response.AddHeader("Access-Control-Allow-Credentials", "true");
                filterContext.RequestContext.HttpContext.Response.AddHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
                base.OnActionExecuting(filterContext);
            }
        }
    }
}