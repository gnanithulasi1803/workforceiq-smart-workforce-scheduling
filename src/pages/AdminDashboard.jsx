import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080/api";

function AdminDashboard() {
    const [stats, setStats] = useState({
        employees: 0,
        activeEmployees: 0,
        shifts: 0,
        rosters: 0,
        assignedRosters: 0,
        pendingLeaves: 0,
        pendingSwaps: 0,
        holidays: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const token = localStorage.getItem("token");

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const [
                employeesRes,
                shiftsRes,
                rostersRes,
                leavesRes,
                swapsRes,
                holidaysRes,
            ] = await Promise.all([
                fetch(`${API_BASE}/employees`, { headers }),
                fetch(`${API_BASE}/shifts`, { headers }),
                fetch(`${API_BASE}/rosters`, { headers }),
                fetch(`${API_BASE}/leaves`, { headers }),
                fetch(`${API_BASE}/shift-swaps`, { headers }),
                fetch(`${API_BASE}/holidays`, { headers }),
            ]);

            if (
                !employeesRes.ok ||
                !shiftsRes.ok ||
                !rostersRes.ok ||
                !leavesRes.ok ||
                !swapsRes.ok ||
                !holidaysRes.ok
            ) {
                throw new Error("Failed to load admin dashboard data");
            }

            const employees = await employeesRes.json();
            const shifts = await shiftsRes.json();
            const rosters = await rostersRes.json();
            const leaves = await leavesRes.json();
            const swaps = await swapsRes.json();
            const holidays = await holidaysRes.json();

            setStats({
                employees: employees.length,

                activeEmployees: employees.filter(
                    (e) => e.status?.toUpperCase() === "ACTIVE"
                ).length,

                shifts: shifts.length,

                rosters: rosters.length,

                assignedRosters: rosters.filter(
                    (r) => r.status?.toUpperCase() === "ASSIGNED"
                ).length,

                pendingLeaves: leaves.filter(
                    (l) => l.status?.toUpperCase() === "PENDING"
                ).length,

                pendingSwaps: swaps.filter(
                    (s) => s.status?.toUpperCase() === "PENDING"
                ).length,

                holidays: holidays.length,
            });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={pageStyle}>
                <h1>Admin Dashboard</h1>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div style={pageStyle}>
            <div style={headerStyle}>
                <h1>Admin Dashboard</h1>
                <p>System-wide workforce management and administration.</p>
            </div>

            {error && (
                <div style={errorStyle}>
                    {error}
                </div>
            )}

            <div style={gridStyle}>
                <StatCard
                    title="Total Employees"
                    value={stats.employees}
                />

                <StatCard
                    title="Active Employees"
                    value={stats.activeEmployees}
                />

                <StatCard
                    title="Total Shifts"
                    value={stats.shifts}
                />

                <StatCard
                    title="Roster Records"
                    value={stats.rosters}
                />

                <StatCard
                    title="Assigned Rosters"
                    value={stats.assignedRosters}
                />

                <StatCard
                    title="Pending Leaves"
                    value={stats.pendingLeaves}
                />

                <StatCard
                    title="Pending Shift Swaps"
                    value={stats.pendingSwaps}
                />

                <StatCard
                    title="Holidays"
                    value={stats.holidays}
                />
            </div>

            <div style={sectionStyle}>
                <h2>Administration</h2>

                <div style={actionGrid}>
                    <Action
                        title="Employee Management"
                        description="Create, update and remove employee records."
                        path="/employees"
                    />

                    <Action
                        title="Shift Management"
                        description="Manage all workforce shifts."
                        path="/shifts"
                    />

                    <Action
                        title="Roster Management"
                        description="Manage employee rosters."
                        path="/roster"
                    />

                    <Action
                        title="Approvals"
                        description="Approve or reject employee requests."
                        path="/approvals"
                    />

                    <Action
                        title="Policies"
                        description="Manage workforce scheduling policies."
                        path="/policies"
                    />

                    <Action
                        title="Holidays"
                        description="Manage organization holidays."
                        path="/holidays"
                    />

                    <Action
                        title="Reports"
                        description="View workforce reports."
                        path="/reports"
                    />

                    <Action
                        title="Conflict Detection"
                        description="Review roster scheduling conflicts."
                        path="/conflicts"
                    />
                </div>
            </div>

            <button
                onClick={loadDashboard}
                style={refreshButton}
            >
                Refresh Dashboard
            </button>
        </div>
    );
}

function StatCard({ title, value }) {
    return (
        <div style={cardStyle}>
            <div style={labelStyle}>{title}</div>
            <div style={numberStyle}>{value}</div>
        </div>
    );
}

function Action({ title, description, path }) {
    return (
        <div
            style={actionStyle}
            onClick={() => {
                window.location.href = path;
            }}
        >
            <h3>{title}</h3>
            <p>{description}</p>
        </div>
    );
}

const pageStyle = {
    padding: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
};

const headerStyle = {
    marginBottom: "30px",
};

const gridStyle = {
    display: "grid",
    gridTemplateColumns:
        "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "18px",
    marginBottom: "30px",
};

const cardStyle = {
    background: "#fff",
    padding: "22px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const labelStyle = {
    color: "#666",
    fontSize: "14px",
    marginBottom: "10px",
};

const numberStyle = {
    fontSize: "30px",
    fontWeight: "700",
};

const sectionStyle = {
    background: "#fff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "25px",
};

const actionGrid = {
    display: "grid",
    gridTemplateColumns:
        "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "15px",
};

const actionStyle = {
    padding: "20px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    cursor: "pointer",
    background: "#fafafa",
};

const refreshButton = {
    padding: "10px 18px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "600",
};

const errorStyle = {
    padding: "15px",
    marginBottom: "20px",
    borderRadius: "6px",
    background: "#fee2e2",
    color: "#991b1b",
};

export default AdminDashboard;