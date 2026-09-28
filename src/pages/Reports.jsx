import React, { useEffect, useState } from "react";

const API = "http://localhost:8080";

function Reports() {
    const [data, setData] = useState({
        employees: [],
        shifts: [],
        rosters: [],
        leaves: [],
        availability: [],
        holidays: [],
        swaps: [],
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const headers = {
        Authorization: `Bearer ${token}`,
    };

    const loadReports = async () => {
        try {
            setLoading(true);
            setError("");

            const endpoints = [
                ["employees", "/api/employees"],
                ["shifts", "/api/shifts"],
                ["rosters", "/api/rosters"],
                ["leaves", "/api/leaves"],
                ["availability", "/api/availability"],
                ["holidays", "/api/holidays"],
                ["swaps", "/api/shift-swaps"],
            ];

            const results = await Promise.all(
                endpoints.map(async ([key, endpoint]) => {
                    const response = await fetch(
                        `${API}${endpoint}`,
                        { headers }
                    );

                    if (!response.ok) {
                        throw new Error(
                            `Failed to load ${key}`
                        );
                    }

                    return [key, await response.json()];
                })
            );

            const reportData = Object.fromEntries(results);

            setData(reportData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    if (loading) {
        return (
            <div style={{ padding: "30px" }}>
                <h2>Reports</h2>
                <p>Loading reports...</p>
            </div>
        );
    }

    const employees = Array.isArray(data.employees)
        ? data.employees
        : [];

    const shifts = Array.isArray(data.shifts)
        ? data.shifts
        : [];

    const rosters = Array.isArray(data.rosters)
        ? data.rosters
        : [];

    const leaves = Array.isArray(data.leaves)
        ? data.leaves
        : [];

    const availability = Array.isArray(data.availability)
        ? data.availability
        : [];

    const holidays = Array.isArray(data.holidays)
        ? data.holidays
        : [];

    const swaps = Array.isArray(data.swaps)
        ? data.swaps
        : [];

    const getStatus = (item) =>
        String(
            item.status ||
            item.leaveStatus ||
            item.swapStatus ||
            ""
        ).toUpperCase();

    const activeEmployees = employees.filter(
        (employee) =>
            String(employee.status || "").toUpperCase() ===
            "ACTIVE"
    ).length;

    const assignedRosters = rosters.filter(
        (roster) =>
            String(roster.status || "").toUpperCase() ===
            "ASSIGNED"
    ).length;

    const pendingLeaves = leaves.filter(
        (leave) => getStatus(leave) === "PENDING"
    ).length;

    const approvedLeaves = leaves.filter(
        (leave) => getStatus(leave) === "APPROVED"
    ).length;

    const rejectedLeaves = leaves.filter(
        (leave) => getStatus(leave) === "REJECTED"
    ).length;

    const pendingSwaps = swaps.filter(
        (swap) => getStatus(swap) === "PENDING"
    ).length;

    const approvedSwaps = swaps.filter(
        (swap) => getStatus(swap) === "APPROVED"
    ).length;

    return (
        <div
            style={{
                padding: "30px",
                maxWidth: "1200px",
                margin: "0 auto",
            }}
        >
            <h1>Workforce Reports</h1>

            {error && (
                <div
                    style={{
                        background: "#ffe5e5",
                        color: "#b00020",
                        padding: "12px",
                        borderRadius: "8px",
                        marginBottom: "20px",
                    }}
                >
                    {error}
                </div>
            )}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "15px",
                    marginBottom: "30px",
                }}
            >
                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "20px",
                    }}
                >
                    <h3>Total Employees</h3>
                    <h2>{employees.length}</h2>
                    <p>Active: {activeEmployees}</p>
                </div>

                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "20px",
                    }}
                >
                    <h3>Total Shifts</h3>
                    <h2>{shifts.length}</h2>
                </div>

                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "20px",
                    }}
                >
                    <h3>Roster Records</h3>
                    <h2>{rosters.length}</h2>
                    <p>Assigned: {assignedRosters}</p>
                </div>

                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "20px",
                    }}
                >
                    <h3>Holidays</h3>
                    <h2>{holidays.length}</h2>
                </div>

                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "20px",
                    }}
                >
                    <h3>Availability Records</h3>
                    <h2>{availability.length}</h2>
                </div>
            </div>

            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "20px",
                    marginBottom: "20px",
                }}
            >
                <h2>Leave Summary</h2>

                <p>
                    <strong>Total:</strong> {leaves.length}
                </p>

                <p>
                    <strong>Pending:</strong> {pendingLeaves}
                </p>

                <p>
                    <strong>Approved:</strong> {approvedLeaves}
                </p>

                <p>
                    <strong>Rejected:</strong> {rejectedLeaves}
                </p>
            </div>

            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "20px",
                }}
            >
                <h2>Shift Swap Summary</h2>

                <p>
                    <strong>Total:</strong> {swaps.length}
                </p>

                <p>
                    <strong>Pending:</strong> {pendingSwaps}
                </p>

                <p>
                    <strong>Approved:</strong> {approvedSwaps}
                </p>
            </div>
        </div>
    );
}

export default Reports;