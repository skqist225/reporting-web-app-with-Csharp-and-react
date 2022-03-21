using DevExpress.DataAccess.Sql;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace WebApplication1.Services
{
    public class ConnectToDatabase {

        private SqlConnection sqlConnection = null;

        public ConnectToDatabase() {
            sqlConnection = new SqlConnection()
            {
                ConnectionString = ConfigurationManager.ConnectionStrings["QLDSV_HTC2"].ConnectionString
            };
        }

        public SqlDataSource CreateSQLDataSource(String query)
        {
            SqlDataSource dataSource = new SqlDataSource("QLDSV_HTC");
            CustomSqlQuery customSqlQuery = new CustomSqlQuery();
            customSqlQuery.Name = "QLDSV_HTC";
            customSqlQuery.Sql = query;

            dataSource.Queries.Add(customSqlQuery);
            dataSource.Fill();
            return dataSource;
        }

        public DataSet PerformQuery(String query)
        {
            if(sqlConnection != null) sqlConnection.Close();
            sqlConnection.Open();

            SqlDataAdapter sda = new SqlDataAdapter()
            {
                SelectCommand = new SqlCommand(query, sqlConnection)
            };

            DataSet ds = new DataSet();
            sda.Fill(ds);
            sqlConnection.Close();

            return ds;
        }
    }
}