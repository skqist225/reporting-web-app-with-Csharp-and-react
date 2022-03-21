using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebApplication1.Reports;

namespace WebApplication1.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }

        public ActionResult Viewer()
        {
            if (Request.QueryString["TableName"] == null)
                Response.Redirect("Viewer?TableName=Vattu");
            else
            {
                string tableName = Request.QueryString["TableName"];
                XtraReport1 report = new XtraReport1(tableName);
                return View(report);
            }

            return View(new DevExpress.XtraReports.UI.XtraReport());
        }
    }
}