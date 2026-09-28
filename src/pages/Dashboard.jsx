import React, { useEffect, useState } from "react";

export default function Dashboard() {
    const username = localStorage.getItem("username") || "Employee";
    const role = localStorage.getItem("role") || "EMPLOYEE";
    const token = localStorage.getItem("token");

    const [employee, setEmployee] = useState(null);
    const [rosters, setRosters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            const employeeResponse = await fetch(
                "http://localhost:8080/api/employees",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!employeeResponse.ok) {
                throw new Error("Failed to load employee information");
            }

            const employees = await employeeResponse.json();

            const currentEmployee = employees.find(
                (emp) =>
                    emp.employeeCode?.toUpperCase() ===
                    username.toUpperCase()
            );

            if (!currentEmployee) {
                throw new Error("Logged-in employee was not found");
            }

            setEmployee(currentEmployee);

            const rosterResponse = await fetch(
                `http://localhost:8080/api/rosters/employee/${currentEmployee.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!rosterResponse.ok) {
                throw new Error("Failed to load roster information");
            }

            const rosterData = await rosterResponse.json();

            setRosters(Array.isArray(rosterData) ? rosterData : []);
        } catch (err) {
            console.error("Dashboard loading error:", err);
            setError(err.message || "Unable to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const today = new Date().toISOString().split("T")[0];

    const assignedRosters = rosters.filter(
        (roster) =>
            roster.status &&
            roster.status.toUpperCase() === "ASSIGNED"
    );

    const todaysRoster = assignedRosters.find(
        (roster) => roster.rosterDate === today
    );

    const upcomingRosters = assignedRosters.filter(
        (roster) => roster.rosterDate > today
    );

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(`${date}T00:00:00`).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f5f7fb",
                padding: "30px",
                fontFamily: "Arial, sans-serif",
            }}
        >
            {/* Header */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "30px",
                }}
            >
                <div>
                    <h1 style={{ margin: 0, color: "#1f2937" }}>
                        WorkforceIQ
                    </h1>

                    <p
                        style={{
                            marginTop: "8px",
                            color: "#6b7280",
                        }}
                    >
                        Workforce Scheduling & Management
                    </p>
                </div>

                <div
                    style={{
                        background: "#ffffff",
                        padding: "12px 18px",
                        borderRadius: "10px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                >
                    <strong>{username}</strong>

                    <div
                        style={{
                            color: "#6b7280",
                            fontSize: "14px",
                        }}
                    >
                        {role}
                    </div>
                </div>
            </div>

            {/* Welcome */}
            <div
                style={{
                    background: "#ffffff",
                    padding: "25px",
                    borderRadius: "12px",
                    marginBottom: "25px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
            >
                <h2 style={{ marginTop: 0 }}>
                    Welcome back, {username} 👋
                </h2>

                <p
                    style={{
                        color: "#6b7280",
                        marginBottom: 0,
                    }}
                >
                    {employee
                        ? `Employee: ${employee.firstName || ""} ${
                            employee.lastName || ""
                        }`
                        : "Here is your workforce dashboard overview."}
                </p>
            </div>

            {/* Loading */}
            {loading && (
                <div
                    style={{
                        background: "#ffffff",
                        padding: "20px",
                        borderRadius: "12px",
                        marginBottom: "25px",
                    }}
                >
                    Loading dashboard data...
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div
                    style={{
                        background: "#ffffff",
                        padding: "20px",
                        borderRadius: "12px",
                        marginBottom: "25px",
                        color: "#b91c1c",
                    }}
                >
                    {error}
                </div>
            )}

            {/* Statistics */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: "20px",
                    marginBottom: "25px",
                }}
            >
                <div
                    style={{
                        background: "#ffffff",
                        padding: "22px",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                >
                    <h3>Today's Shift</h3>

                    <p
                        style={{
                            fontSize: "20px",
                            fontWeight: "bold",
                        }}
                    >
                        {loading
                            ? "Loading..."
                            : todaysRoster
                                ? "Assigned"
                                : "Not Assigned"}
                    </p>
                </div>

                <div
                    style={{
                        background: "#ffffff",
                        padding: "22px",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                >
                    <h3>Upcoming Shifts</h3>

                    <p
                        style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                        }}
                    >
                        {loading ? "..." : upcomingRosters.length}
                    </p>
                </div>

                <div
                    style={{
                        background: "#ffffff",
                        padding: "22px",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                >
                    <h3>Leave Status</h3>

                    <p
                        style={{
                            fontSize: "20px",
                            fontWeight: "bold",
                        }}
                    >
                        No Requests
                    </p>
                </div>

                <div
                    style={{
                        background: "#ffffff",
                        padding: "22px",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                >
                    <h3>Shift Swaps</h3>

                    <p
                        style={{
                            fontSize: "24px",
                            fontWeight: "bold",
                        }}
                    >
                        0
                    </p>
                </div>
            </div>

            {/* Main Sections */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "25px",
                }}
            >
                {/* Upcoming Schedule */}
                <div
                    style={{
                        background: "#ffffff",
                        padding: "25px",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                >
                    <h2>Upcoming Schedule</h2>

                    {loading ? (
                        <p style={{ color: "#6b7280" }}>
                            Loading schedule...
                        </p>
                    ) : upcomingRosters.length === 0 ? (
                        <div
                            style={{
                                padding: "25px",
                                textAlign: "center",
                                color: "#6b7280",
                                border: "1px dashed #d1d5db",
                                borderRadius: "8px",
                            }}
                        >
                            No upcoming shifts available.
                        </div>
                    ) : (
                        upcomingRosters
                            .slice(0, 5)
                            .map((roster) => (
                                <div
                                    key={roster.id}
                                    style={{
                                        padding: "15px",
                                        marginBottom: "12px",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "8px",
                                    }}
                                >
                                    <strong>
                                        {formatDate(
                                            roster.rosterDate
                                        )}
                                    </strong>

                                    <div
                                        style={{
                                            marginTop: "6px",
                                            color: "#6b7280",
                                        }}
                                    >
                                        Shift:{" "}
                                        {roster.shift?.name ||
                                            roster.shift?.shiftName ||
                                            roster.shiftName ||
                                            "Assigned Shift"}
                                    </div>

                                    <div
                                        style={{
                                            marginTop: "4px",
                                            color: "#6b7280",
                                        }}
                                    >
                                        Status: {roster.status}
                                    </div>
                                </div>
                            ))
                    )}
                </div>

                {/* Quick Actions */}
                <div
                    style={{
                        background: "#ffffff",
                        padding: "25px",
                        borderRadius: "12px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                    }}
                >
                    <h2>Quick Actions</h2>

                    <button
                        onClick={() => {
                            window.location.href = "/my-roster";
                        }}
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginBottom: "12px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                        }}
                    >
                        View My Roster
                    </button>

                    <button
                        onClick={() => {
                            window.location.href = "/availability";
                        }}
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginBottom: "12px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                        }}
                    >
                        Manage My Availability
                    </button>

                    <button
                        onClick={() => {
                            window.location.href = "/leave";
                        }}
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginBottom: "12px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                        }}
                    >
                        Apply for Leave
                    </button>

                    <button
                        onClick={() => {
                            window.location.href = "/shift-swap";
                        }}
                        style={{
                            width: "100%",
                            padding: "12px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                        }}
                    >
                        Request Shift Swap
                    </button>
                    <button
                        onClick={() => {
                            window.location.href = "/holidays";
                        }}
                        style={{
                            width: "100%",
                            padding: "12px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                        }}
                    >
                        View Holidays
                    </button>
                </div>
            </div>

            {/* Notifications */}
            <div
                style={{
                    background: "#ffffff",
                    padding: "25px",
                    borderRadius: "12px",
                    marginTop: "25px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
            >
                <h2>Notifications</h2>

                <p style={{ color: "#6b7280" }}>
                    No new notifications.
                </p>
            </div>
        </div>
    );
}