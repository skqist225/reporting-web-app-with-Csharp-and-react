using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using DevExpress.XtraReports.Services;
using DevExpress.XtraReports.Web.WebDocumentViewer;
using WebApplication1.Services;
using DevExpress.XtraReports.Web.Extensions;

public class MyReportStorage : ReportStorageWebExtension
{
    // ...
}

namespace WebApplication1
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);
            DefaultWebDocumentViewerContainer.Register<IReportProvider, CustomReportProvider>();
            ReportStorageWebExtension.RegisterExtensionGlobal(new MyReportStorage());
        }
    }
}
