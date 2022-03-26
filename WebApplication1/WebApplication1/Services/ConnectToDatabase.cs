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

        public SqlDataSource CreateSQLDataSource(String tableName, String query)
        {
                SqlDataSource dataSource = new SqlDataSource(tableName);
                CustomSqlQuery customSqlQuery = new CustomSqlQuery();
                customSqlQuery.Name = tableName;
                customSqlQuery.Sql = query;

                dataSource.Queries.Add(customSqlQuery);
                dataSource.Fill();
                return dataSource;
        }

        public DataSet PerformQuery(String query)
        {
            DataSet ds = new DataSet();
            try
            {
                if (sqlConnection != null) sqlConnection.Close();
                sqlConnection.Open();

                SqlDataAdapter sda = new SqlDataAdapter()
                {
                    SelectCommand = new SqlCommand(query, sqlConnection)
                };
                sda.Fill(ds);
            }
            catch (Exception ex)
            {
                return null;
            }
            finally
            {
                sqlConnection.Close();
            }

            return ds;
        }
    }
}