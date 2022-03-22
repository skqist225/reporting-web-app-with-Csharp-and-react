using DevExpress.XtraReports.Web.Extensions;
using System.Collections.Generic;
using System.Text;

namespace WebApplication1.Services
{
    public class ReportStorageWebExtension : DevExpress.XtraReports.Web.Extensions.ReportStorageWebExtension
    {
        public override bool CanSetData(string url)
        {
            return base.CanSetData(url);
        }
        public override bool IsValidUrl(string url)
        {
            return base.IsValidUrl(url);
        }

        public override byte[] GetData(string url)
        {
            string[] parts = url.Split('?');
            string parameterQueryString = parts.Length > 1 ? parts[1] : string.Empty;
           
            return Encoding.ASCII.GetBytes(parameterQueryString.Split('=')[1]);
        }

        public override Dictionary<string, string> GetUrls()
        {
            return base.GetUrls();
        }

        public override void SetData(DevExpress.XtraReports.UI.XtraReport report, string url)
        {
            base.SetData(report, url);
        }

        public override string SetNewData(DevExpress.XtraReports.UI.XtraReport report, string defaultUrl)
        {
            return base.SetNewData(report, defaultUrl);
        }
    }
}
