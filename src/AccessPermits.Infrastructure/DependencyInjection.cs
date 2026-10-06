using System;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using AccessPermits.Core.Interfaces;
using AccessPermits.Infrastructure.Data;
using AccessPermits.Infrastructure.Repositories;

namespace AccessPermits.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            var useInMemory = configuration.GetValue<bool>("UseInMemoryDatabase");

            bool canConnectToSql = false;
            if (!useInMemory && !string.IsNullOrEmpty(connectionString))
            {
                try
                {
                    var builder = new SqlConnectionStringBuilder(connectionString)
                    {
                        ConnectTimeout = 2 // Quick 2-second check
                    };
                    using var conn = new SqlConnection(builder.ConnectionString);
                    conn.Open();
                    canConnectToSql = true;
                }
                catch
                {
                    canConnectToSql = false;
                }
            }

            services.AddDbContext<AccessPermitsDbContext>(options =>
            {
                if (canConnectToSql && !string.IsNullOrEmpty(connectionString))
                {
                    options.UseSqlServer(connectionString, sqlOptions =>
                    {
                        sqlOptions.MigrationsAssembly(typeof(AccessPermitsDbContext).Assembly.FullName);
                        sqlOptions.EnableRetryOnFailure(maxRetryCount: 3, maxRetryDelay: TimeSpan.FromSeconds(5), errorNumbersToAdd: null);
                    });
                }
                else
                {
                    options.UseInMemoryDatabase("AccessPermitsDb");
                }
            });

            services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            return services;
        }
    }
}
