import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/rosters";

function Conflicts() {
    const [conflicts, setConflicts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        loadConflicts();
    }, []);

    const loadConflicts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to load roster data");
            }

            const rosters = await response.json();

            const detectedConflicts = detectConflicts(rosters);

            setConflicts(detectedConflicts);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const detectConflicts = (rosters) => {
        const result = [];

        const groups = {};

        rosters.forEach((roster) => {
            const employeeId =
                roster.employee?.id ?? "unknown";

            const date = roster.rosterDate;

            const key = `${employeeId}_${date}`;

            if (!groups[key]) {
                groups[key] = [];
            }

            groups[key].push(roster);
        });

        Object.values(groups).forEach((group) => {
            const employee = group[0]?.employee;

            const employeeName =
                employee?.name || "Unknown Employee";

            const employeeCode =
                employee?.employeeCode || "N/A";

            const date = group[0]?.rosterDate;

            const assigned = group.filter(
                (roster) =>
                    roster.status?.toUpperCase() === "ASSIGNED"
            );

            const leave = group.filter(
                (roster) =>
                    roster.status?.toUpperCase() === "LEAVE"
            );

            /*
             * Conflict 1:
             * More than one ASSIGNED roster
             * for the same employee and date.
             */
            if (assigned.length > 1) {
                const shiftNames = assigned
                    .map(
                        (roster) =>
                            roster.shift?.shiftName || "Unknown Shift"
                    )
                    .join(", ");

                result.push({
                    id: `duplicate-${employee?.id}-${date}`,
                    type: "Duplicate Assignment",
                    employeeName,
                    employeeCode,
                    date,
                    details: `Employee has ${assigned.length} assigned shifts on the same date: ${shiftNames}`,
                });
            }

            /*
             * Conflict 2:
             * Employee has both ASSIGNED and LEAVE
             * records on the same date.
             */
            if (
                assigned.length > 0 &&
                leave.length > 0
            ) {
                result.push({
                    id: `leave-${employee?.id}-${date}`,
                    type: "Leave Conflict",
                    employeeName,
                    employeeCode,
                    date,
                    details:
                        "Employee has an assigned shift while also marked as on leave.",
                });
            }

            /*
             * Conflict 3:
             * Multiple different assigned shifts
             * on the same employee/date.
             */
            const shiftIds = new Set(
                assigned
                    .map((roster) => roster.shift?.id)
                    .filter((id) => id !== undefined && id !== null)
            );

            if (shiftIds.size > 1) {
                result.push({
                    id: `multiple-shifts-${employee?.id}-${date}`,
                    type: "Multiple Shift Conflict",
                    employeeName,
                    employeeCode,
                    date,
                    details:
                        "Employee is assigned to multiple different shifts on the same date.",
                });
            }

            /*
             * Conflict 4:
             * ASSIGNED roster without a valid employee
             * or shift.
             */
            assigned.forEach((roster) => {
                if (!roster.employee || !roster.shift) {
                    result.push({
                        id: `invalid-${roster.id}`,
                        type: "Invalid Assignment",
                        employeeName,
                        employeeCode,
                        date,
                        details:
                            "Assigned roster is missing employee or shift information.",
                    });
                }
            });
        });

        return result.sort((a, b) =>
            String(a.date).localeCompare(String(b.date))
        );
    };

    return (
        <div
            style={{
                padding: "30px",
                maxWidth: "1200px",
                margin: "0 auto",
            }}
        >
            <div style={{ marginBottom: "25px" }}>
                <h1>Conflict Detection</h1>

                <p style={{ color: "#666" }}>
                    Detect scheduling conflicts from existing roster
                    assignments.
                </p>
            </div>

            {error && (
                <div
                    style={{
                        padding: "12px",
                        marginBottom: "20px",
                        background: "#f8d7da",
                        color: "#721c24",
                        borderRadius: "6px",
                    }}
                >
                    {error}
                </div>
            )}

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "15px",
                    marginBottom: "25px",
                }}
            >
                <div style={summaryCard}>
          <span style={summaryLabel}>
            Total Conflicts
          </span>

                    <strong style={summaryNumber}>
                        {conflicts.length}
                    </strong>
                </div>

                <div style={summaryCard}>
          <span style={summaryLabel}>
            Duplicate Assignments
          </span>

                    <strong style={summaryNumber}>
                        {
                            conflicts.filter(
                                (item) =>
                                    item.type === "Duplicate Assignment"
                            ).length
                        }
                    </strong>
                </div>

                <div style={summaryCard}>
          <span style={summaryLabel}>
            Leave Conflicts
          </span>

                    <strong style={summaryNumber}>
                        {
                            conflicts.filter(
                                (item) =>
                                    item.type === "Leave Conflict"
                            ).length
                        }
                    </strong>
                </div>

                <div style={summaryCard}>
          <span style={summaryLabel}>
            Multiple Shift Conflicts
          </span>

                    <strong style={summaryNumber}>
                        {
                            conflicts.filter(
                                (item) =>
                                    item.type ===
                                    "Multiple Shift Conflict"
                            ).length
                        }
                    </strong>
                </div>
            </div>

            <div
                style={{
                    background: "#fff",
                    padding: "25px",
                    borderRadius: "10px",
                    boxShadow:
                        "0 2px 8px rgba(0,0,0,0.08)",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "20px",
                    }}
                >
                    <h2 style={{ margin: 0 }}>
                        Detected Conflicts
                    </h2>

                    <button
                        onClick={loadConflicts}
                        style={refreshButton}
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <p>Checking roster conflicts...</p>
                ) : conflicts.length === 0 ? (
                    <div
                        style={{
                            padding: "30px",
                            textAlign: "center",
                            background: "#f0fdf4",
                            color: "#166534",
                            borderRadius: "8px",
                        }}
                    >
                        <h3>No conflicts detected</h3>

                        <p>
                            The current roster data does not contain
                            any detected scheduling conflicts.
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                            }}
                        >
                            <thead>
                            <tr>
                                <th style={thStyle}>Type</th>
                                <th style={thStyle}>Employee</th>
                                <th style={thStyle}>Employee Code</th>
                                <th style={thStyle}>Date</th>
                                <th style={thStyle}>Details</th>
                            </tr>
                            </thead>

                            <tbody>
                            {conflicts.map((conflict) => (
                                <tr key={conflict.id}>
                                    <td style={tdStyle}>
                      <span style={conflictBadge}>
                        {conflict.type}
                      </span>
                                    </td>

                                    <td style={tdStyle}>
                                        {conflict.employeeName}
                                    </td>

                                    <td style={tdStyle}>
                                        {conflict.employeeCode}
                                    </td>

                                    <td style={tdStyle}>
                                        {conflict.date}
                                    </td>

                                    <td style={tdStyle}>
                                        {conflict.details}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

const summaryCard = {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
};

const summaryLabel = {
    display: "block",
    color: "#666",
    marginBottom: "8px",
};

const summaryNumber = {
    fontSize: "28px",
};

const refreshButton = {
    padding: "9px 16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    background: "#2563eb",
    color: "#fff",
};

const conflictBadge = {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "5px",
    background: "#fee2e2",
    color: "#991b1b",
    fontSize: "13px",
    fontWeight: "600",
};

const thStyle = {
    padding: "12px",
    borderBottom: "2px solid #ddd",
    textAlign: "left",
};

const tdStyle = {
    padding: "12px",
    borderBottom: "1px solid #eee",
    verticalAlign: "top",
};

export default Conflicts;