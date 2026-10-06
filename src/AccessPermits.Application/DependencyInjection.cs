using Microsoft.Extensions.DependencyInjection;
using AccessPermits.Application.Interfaces;
using AccessPermits.Application.Services;

namespace AccessPermits.Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IOrganizationService, OrganizationService>();
            services.AddScoped<IRegistryService, RegistryService>();
            services.AddScoped<IPermitService, PermitService>();
            services.AddScoped<IGateService, GateService>();
            services.AddScoped<IDashboardService, DashboardService>();
            services.AddScoped<ISystemConfigService, SystemConfigService>();

            return services;
        }
    }
}
