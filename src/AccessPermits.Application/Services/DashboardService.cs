using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AccessPermits.Application.DTOs;
using AccessPermits.Application.Interfaces;
using AccessPermits.Core.Entities.Permits;
using AccessPermits.Core.Entities.Organization;
using AccessPermits.Core.Entities.GateOperations;
using AccessPermits.Core.Interfaces;

namespace AccessPermits.Application.Services
{
    public class DashboardService : IDashboardService
    {
        private readonly IUnitOfWork _unitOfWork;

        public DashboardService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<ApiResponse<DashboardStatsDto>> GetDashboardStatsAsync(string? branchId = null, string? currentUserId = null, string? role = null)
        {
            var todayStr = DateTime.UtcNow.ToString("yyyy-MM-dd");

            var permitsQuery = _unitOfWork.Repository<IssuedPermit>().Query().AsQueryable();
            var requestsQuery = _unitOfWork.Repository<PermitRequest>().Query().Where(r => r.Status == "pending").AsQueryable();
            var queriesQuery = _unitOfWork.Repository<QueryLog>().Query().AsQueryable();

            if (!string.IsNullOrEmpty(branchId))
            {
                permitsQuery = permitsQuery.Where(p => p.BranchId == branchId);
                requestsQuery = requestsQuery.Where(r => r.BranchId == branchId);
            }

            if (role == "requester" && !string.IsNullOrEmpty(currentUserId))
            {
                permitsQuery = permitsQuery.Where(p => p.SubmitterId == currentUserId);
                requestsQuery = requestsQuery.Where(r => r.SubmitterId == currentUserId);
            }

            var permits = await permitsQuery.ToListAsync();
            var pendingCount = await requestsQuery.CountAsync();
            var queryCount = await queriesQuery.CountAsync();

            var activeCount = permits.Count(p => p.Status == "active" && string.Compare(p.ExpiryDate, todayStr) >= 0);
            var expiredCount = permits.Count(p => p.Status == "expired" || (p.Status == "active" && string.Compare(p.ExpiryDate, todayStr) < 0));

            var branches = await _unitOfWork.Repository<Branch>().GetAllAsync();
            var buildings = await _unitOfWork.Repository<Building>().GetAllAsync();
            var gates = await _unitOfWork.Repository<Gate>().GetAllAsync();
            var paths = await _unitOfWork.Repository<FacilityPath>().GetAllAsync();
            var departments = await _unitOfWork.Repository<Department>().GetAllAsync();

            var stats = new DashboardStatsDto
            {
                ActivePermits = activeCount,
                PendingRequests = pendingCount,
                ExpiredPermits = expiredCount,
                TotalQueries = queryCount,
                TotalBranches = branches.Count(),
                TotalBuildings = buildings.Count(),
                TotalGates = gates.Count(),
                TotalPaths = paths.Count(),
                TotalDepartments = departments.Count()
            };

            // Status chart
            int totalStatus = activeCount + pendingCount + expiredCount;
            if (totalStatus == 0) totalStatus = 1;

            stats.StatusChart = new List<ChartBarDto>
            {
                new() { Label = "✅ نشطة", Value = activeCount, Percentage = (int)Math.Round((double)activeCount / totalStatus * 100), ColorClass = "green" },
                new() { Label = "📋 بانتظار", Value = pendingCount, Percentage = (int)Math.Round((double)pendingCount / totalStatus * 100), ColorClass = "gold" },
                new() { Label = "⏱ منتهية", Value = expiredCount, Percentage = (int)Math.Round((double)expiredCount / totalStatus * 100), ColorClass = "red" }
            };

            // Branch chart
            var colors = new[] { "green", "gold", "blue", "red", "purple", "teal" };
            var byBranch = permits.GroupBy(p => p.BranchName)
                .Select(g => new { Name = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .ToList();

            int maxBranch = byBranch.Any() ? byBranch.Max(x => x.Count) : 1;
            int cIdx = 0;
            stats.BranchChart = byBranch.Select(b => new ChartBarDto
            {
                Label = "🏢 " + b.Name,
                Value = b.Count,
                Percentage = (int)Math.Round((double)b.Count / maxBranch * 100),
                ColorClass = colors[(cIdx++) % colors.Length]
            }).ToList();

            // Building chart
            var byBuilding = permits.GroupBy(p => p.BuildingName)
                .Select(g => new { Name = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(6)
                .ToList();

            int maxBldg = byBuilding.Any() ? byBuilding.Max(x => x.Count) : 1;
            cIdx = 0;
            stats.BuildingChart = byBuilding.Select(b => new ChartBarDto
            {
                Label = "🏬 " + b.Name,
                Value = b.Count,
                Percentage = (int)Math.Round((double)b.Count / maxBldg * 100),
                ColorClass = colors[(cIdx++) % colors.Length]
            }).ToList();

            // Department chart
            var byDept = permits.GroupBy(p => p.RequestingDept)
                .Select(g => new { Name = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(6)
                .ToList();

            int maxDept = byDept.Any() ? byDept.Max(x => x.Count) : 1;
            cIdx = 0;
            stats.DepartmentChart = byDept.Select(d => new ChartBarDto
            {
                Label = "🏛️ " + d.Name,
                Value = d.Count,
                Percentage = (int)Math.Round((double)d.Count / maxDept * 100),
                ColorClass = colors[(cIdx++) % colors.Length]
            }).ToList();

            return ApiResponse<DashboardStatsDto>.Ok(stats);
        }
    }
}
