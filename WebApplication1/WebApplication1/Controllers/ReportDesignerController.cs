using DevExpress.DataAccess.Sql;
using DevExpress.Web.Mvc.Controllers;
using DevExpress.XtraReports.Web.ReportDesigner;
using System.Collections.Generic;
using System.Configuration;
using System.Web.Mvc;
using System.Data.SqlClient;
using System;
using System.Data;
using DevExpress.DataAccess.ConnectionParameters;
using System.Collections.Generic;
using DevExpress.DataAccess.Sql;

namespace WebApplication1.Controllers
{
    public class ReportDesignerController : ReportDesignerApiControllerBase
    {
        // GET: ReportDesigner
        public override ActionResult Invoke()
        {
            var result = base.Invoke();
            // Allow cross-domain requests.
            Response.AppendHeader("Access-Control-Allow-Origin", "*");
            return result;
        }

        public ActionResult GetReportDesignerModel(string reportUrl)
        {
            Response.AppendHeader("Access-Control-Allow-Origin", "*");

            string modelJsonScript =
                new ReportDesignerClientSideModelGenerator()
                .GetJsonModelScript(
                    reportUrl,                 // The URL of a report that is opened in the Report Designer when the application starts.
                    GetAvailableDataSources(), // Available data sources in the Report Designer that can be added to reports.
                    "ReportDesigner/Invoke",   // The URI path of the controller action that processes requests from the Report Designer.
                    "WebDocumentViewer/Invoke",// The URI path of the controller action that processes requests from the Web Document Viewer.
                    "QueryBuilder/Invoke"      // The URI path of the controller action that processes requests from the Query Builder.
                );
            return Content(modelJsonScript, "application/json");
        }

        Dictionary<string, object> GetAvailableDataSources()
        {
            var dataSources = new Dictionary<string, object>();
            
            SqlDataSource ds = new SqlDataSource("QLVT");
            var query = SelectQueryFluentBuilder.AddTable("Vattu").SelectAllColumns().Build("Vattu");
            ds.Queries.Add(query);
            ds.RebuildResultSchema();
            dataSources.Add("SqlDataSource", ds);
            return dataSources;
        }
    }
}