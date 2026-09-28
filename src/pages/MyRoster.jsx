import React, { useEffect, useState } from "react";

export default function MyRoster() {
    const username = localStorage.getItem("username") || "Employee";
    const token = localStorage.getItem("token");

    const [employee, setEmployee] = useState(null);
    const [rosters, setRosters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadRoster();
    }, []);

    const loadRoster = async () => {
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
                throw new Error("Employee not found");
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
                throw new Error("Failed to load roster");
            }

            const rosterData = await rosterResponse.json();

            setRosters(Array.isArray(rosterData) ? rosterData : []);
        } catch (err) {
            console.error("My Roster error:", err);
            setError(err.message || "Unable to load roster");
        } finally {
            setLoading(false);
        }
    };

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
            <div
                style={{
                    maxWidth: "1100px",
                    margin: "0 auto",
                }}
            >
                <h1 style={{ color: "#1f2937" }}>
                    My Roster
                </h1>

                <p style={{ color: "#6b7280" }}>
                    {employee
                        ? `${employee.firstName || ""} ${
                            employee.lastName || ""
                        } • ${employee.employeeCode}`
                        : username}
                </p>

                {loading && (
                    <div
                        style={{
                            background: "#ffffff",
                            padding: "25px",
                            borderRadius: "12px",
                            marginTop: "25px",
                        }}
                    >
                        Loading your roster...
                    </div>
                )}

                {!loading && error && (
                    <div
                        style={{
                            background: "#ffffff",
                            padding: "25px",
                            borderRadius: "12px",
                            marginTop: "25px",
                            color: "#b91c1c",
                        }}
                    >
                        {error}
                    </div>
                )}

                {!loading && !error && rosters.length === 0 && (
                    <div
                        style={{
                            background: "#ffffff",
                            padding: "40px",
                            borderRadius: "12px",
                            marginTop: "25px",
                            textAlign: "center",
                            color: "#6b7280",
                        }}
                    >
                        No roster assignments found.
                    </div>
                )}

                {!loading && !error && rosters.length > 0 && (
                    <div
                        style={{
                            background: "#ffffff",
                            borderRadius: "12px",
                            marginTop: "25px",
                            overflow: "hidden",
                            boxShadow:
                                "0 2px 8px rgba(0,0,0,0.06)",
                        }}
                    >
                        <div
                            style={{
                                padding: "20px 25px",
                                borderBottom:
                                    "1px solid #e5e7eb",
                            }}
                        >
                            <h2 style={{ margin: 0 }}>
                                Assigned Shifts
                            </h2>
                        </div>

                        <div style={{ overflowX: "auto" }}>
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse:
                                        "collapse",
                                }}
                            >
                                <thead>
                                <tr
                                    style={{
                                        background:
                                            "#f9fafb",
                                        textAlign: "left",
                                    }}
                                >
                                    <th
                                        style={{
                                            padding: "15px",
                                        }}
                                    >
                                        Date
                                    </th>

                                    <th
                                        style={{
                                            padding: "15px",
                                        }}
                                    >
                                        Shift
                                    </th>

                                    <th
                                        style={{
                                            padding: "15px",
                                        }}
                                    >
                                        Status
                                    </th>
                                </tr>
                                </thead>

                                <tbody>
                                {rosters.map(
                                    (roster) => (
                                        <tr
                                            key={
                                                roster.id
                                            }
                                            style={{
                                                borderTop:
                                                    "1px solid #e5e7eb",
                                            }}
                                        >
                                            <td
                                                style={{
                                                    padding:
                                                        "15px",
                                                }}
                                            >
                                                {formatDate(
                                                    roster.rosterDate
                                                )}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "15px",
                                                }}
                                            >
                                                {roster
                                                        .shift
                                                        ?.name ||
                                                    roster
                                                        .shift
                                                        ?.shiftName ||
                                                    roster.shiftName ||
                                                    "Assigned Shift"}
                                            </td>

                                            <td
                                                style={{
                                                    padding:
                                                        "15px",
                                                }}
                                            >
                                                {roster.status ||
                                                    "-"}
                                            </td>
                                        </tr>
                                    )
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}