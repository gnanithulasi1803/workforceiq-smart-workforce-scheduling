import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:8080/api";

function RosterManagement() {
    const [rosters, setRosters] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [shifts, setShifts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [filterDate, setFilterDate] = useState("");
    const [filterEmployee, setFilterEmployee] = useState("");
    const [filterStatus, setFilterStatus] = useState("");

    const [generateYear, setGenerateYear] = useState(
        new Date().getFullYear()
    );
    const [generateMonth, setGenerateMonth] = useState(
        new Date().getMonth() + 1
    );

    const getToken = () => localStorage.getItem("token");

    const getHeaders = () => ({
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
    });

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [rosterResponse, employeeResponse, shiftResponse] =
                await Promise.all([
                    fetch(`${API_BASE}/rosters`, {
                        headers: getHeaders(),
                    }),
                    fetch(`${API_BASE}/employees`, {
                        headers: getHeaders(),
                    }),
                    fetch(`${API_BASE}/shifts`, {
                        headers: getHeaders(),
                    }),
                ]);

            if (!rosterResponse.ok) {
                throw new Error("Failed to load rosters");
            }

            if (!employeeResponse.ok) {
                throw new Error("Failed to load employees");
            }

            if (!shiftResponse.ok) {
                throw new Error("Failed to load shifts");
            }

            const rosterData = await rosterResponse.json();
            const employeeData = await employeeResponse.json();
            const shiftData = await shiftResponse.json();

            setRosters(Array.isArray(rosterData) ? rosterData : []);
            setEmployees(Array.isArray(employeeData) ? employeeData : []);
            setShifts(Array.isArray(shiftData) ? shiftData : []);
        } catch (err) {
            setError(err.message || "Failed to load roster data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const getEmployeeName = (roster) => {
        if (roster.employee) {
            return (
                roster.employee.name ||
                roster.employee.employeeCode ||
                `Employee ${roster.employee.id}`
            );
        }

        return "Unassigned";
    };

    const getEmployeeId = (roster) => {
        return roster.employee?.id || "";
    };

    const getShiftName = (roster) => {
        if (roster.shift) {
            return roster.shift.shiftName || `Shift ${roster.shift.id}`;
        }

        return "OFF / No Shift";
    };

    const filteredRosters = rosters.filter((roster) => {
        const matchesDate =
            !filterDate || roster.rosterDate === filterDate;

        const matchesEmployee =
            !filterEmployee ||
            String(getEmployeeId(roster)) === String(filterEmployee);

        const matchesStatus =
            !filterStatus ||
            String(roster.status || "").toUpperCase() ===
            filterStatus.toUpperCase();

        return matchesDate && matchesEmployee && matchesStatus;
    });

    const handleGenerate = async () => {
        try {
            setMessage("");
            setError("");

            const response = await fetch(
                `${API_BASE}/rosters/generate?year=${generateYear}&month=${generateMonth}`,
                {
                    method: "POST",
                    headers: getHeaders(),
                }
            );

            const text = await response.text();

            if (!response.ok) {
                throw new Error(text || "Failed to generate roster");
            }

            setMessage(text || "Roster generated successfully.");
            await loadData();
        } catch (err) {
            setError(err.message || "Failed to generate roster");
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this roster record?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setMessage("");
            setError("");

            const response = await fetch(`${API_BASE}/rosters/${id}`, {
                method: "DELETE",
                headers: getHeaders(),
            });

            const text = await response.text();

            if (!response.ok) {
                throw new Error(text || "Failed to delete roster");
            }

            setMessage(text || "Roster record deleted successfully.");
            await loadData();
        } catch (err) {
            setError(err.message || "Failed to delete roster");
        }
    };

    const clearFilters = () => {
        setFilterDate("");
        setFilterEmployee("");
        setFilterStatus("");
    };

    const assignedCount = rosters.filter(
        (r) => String(r.status).toUpperCase() === "ASSIGNED"
    ).length;

    const leaveCount = rosters.filter(
        (r) => String(r.status).toUpperCase() === "LEAVE"
    ).length;

    const offCount = rosters.filter(
        (r) => String(r.status).toUpperCase() === "OFF"
    ).length;

    if (loading) {
        return (
            <div style={styles.page}>
                <div style={styles.card}>
                    <h2>Roster Management</h2>
                    <p>Loading roster data...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Roster Management</h1>
                    <p style={styles.subtitle}>
                        Manage employee roster assignments and generate monthly rosters.
                    </p>
                </div>

                <button style={styles.refreshButton} onClick={loadData}>
                    Refresh
                </button>
            </div>

            {message && (
                <div style={styles.success}>
                    {message}
                </div>
            )}

            {error && (
                <div style={styles.error}>
                    {error}
                </div>
            )}

            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Total Records</div>
                    <div style={styles.statValue}>{rosters.length}</div>
                </div>

                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Assigned</div>
                    <div style={styles.statValue}>{assignedCount}</div>
                </div>

                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Leave</div>
                    <div style={styles.statValue}>{leaveCount}</div>
                </div>

                <div style={styles.statCard}>
                    <div style={styles.statLabel}>Off</div>
                    <div style={styles.statValue}>{offCount}</div>
                </div>
            </div>

            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Generate Monthly Roster</h2>

                <div style={styles.formRow}>
                    <div style={styles.field}>
                        <label>Year</label>
                        <input
                            type="number"
                            value={generateYear}
                            onChange={(e) =>
                                setGenerateYear(Number(e.target.value))
                            }
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.field}>
                        <label>Month</label>
                        <select
                            value={generateMonth}
                            onChange={(e) =>
                                setGenerateMonth(Number(e.target.value))
                            }
                            style={styles.input}
                        >
                            <option value={1}>January</option>
                            <option value={2}>February</option>
                            <option value={3}>March</option>
                            <option value={4}>April</option>
                            <option value={5}>May</option>
                            <option value={6}>June</option>
                            <option value={7}>July</option>
                            <option value={8}>August</option>
                            <option value={9}>September</option>
                            <option value={10}>October</option>
                            <option value={11}>November</option>
                            <option value={12}>December</option>
                        </select>
                    </div>

                    <button
                        style={styles.primaryButton}
                        onClick={handleGenerate}
                    >
                        Generate Roster
                    </button>
                </div>
            </div>

            <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Filter Rosters</h2>

                <div style={styles.formRow}>
                    <div style={styles.field}>
                        <label>Date</label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.field}>
                        <label>Employee</label>
                        <select
                            value={filterEmployee}
                            onChange={(e) => setFilterEmployee(e.target.value)}
                            style={styles.input}
                        >
                            <option value="">All Employees</option>

                            {employees.map((employee) => (
                                <option key={employee.id} value={employee.id}>
                                    {employee.employeeCode} - {employee.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={styles.field}>
                        <label>Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            style={styles.input}
                        >
                            <option value="">All Statuses</option>
                            <option value="ASSIGNED">ASSIGNED</option>
                            <option value="LEAVE">LEAVE</option>
                            <option value="OFF">OFF</option>
                        </select>
                    </div>

                    <button
                        style={styles.secondaryButton}
                        onClick={clearFilters}
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            <div style={styles.card}>
                <div style={styles.tableHeader}>
                    <h2 style={styles.sectionTitle}>
                        Roster Records ({filteredRosters.length})
                    </h2>
                </div>

                {filteredRosters.length === 0 ? (
                    <div style={styles.empty}>
                        No roster records found.
                    </div>
                ) : (
                    <div style={styles.tableWrapper}>
                        <table style={styles.table}>
                            <thead>
                            <tr>
                                <th style={styles.th}>ID</th>
                                <th style={styles.th}>Date</th>
                                <th style={styles.th}>Employee</th>
                                <th style={styles.th}>Shift</th>
                                <th style={styles.th}>Status</th>
                                <th style={styles.th}>Notes</th>
                                <th style={styles.th}>Action</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filteredRosters.map((roster) => (
                                <tr key={roster.id}>
                                    <td style={styles.td}>{roster.id}</td>

                                    <td style={styles.td}>
                                        {roster.rosterDate || "-"}
                                    </td>

                                    <td style={styles.td}>
                                        {getEmployeeName(roster)}
                                    </td>

                                    <td style={styles.td}>
                                        {getShiftName(roster)}
                                    </td>

                                    <td style={styles.td}>
                      <span
                          style={{
                              ...styles.status,
                              ...(String(roster.status).toUpperCase() ===
                              "ASSIGNED"
                                  ? styles.assigned
                                  : String(roster.status).toUpperCase() ===
                                  "LEAVE"
                                      ? styles.leave
                                      : styles.off),
                          }}
                      >
                        {roster.status || "-"}
                      </span>
                                    </td>

                                    <td style={styles.td}>
                                        {roster.notes || "-"}
                                    </td>

                                    <td style={styles.td}>
                                        <button
                                            style={styles.deleteButton}
                                            onClick={() => handleDelete(roster.id)}
                                        >
                                            Delete
                                        </button>
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

const styles = {
    page: {
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "25px",
    },

    title: {
        margin: 0,
        fontSize: "30px",
        color: "#1f2937",
    },

    subtitle: {
        marginTop: "8px",
        color: "#6b7280",
    },

    card: {
        background: "#ffffff",
        borderRadius: "12px",
        padding: "22px",
        marginBottom: "22px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    },

    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "18px",
        marginBottom: "22px",
    },

    statCard: {
        background: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    },

    statLabel: {
        color: "#6b7280",
        fontSize: "14px",
        marginBottom: "8px",
    },

    statValue: {
        fontSize: "28px",
        fontWeight: "700",
        color: "#111827",
    },

    sectionTitle: {
        margin: "0 0 18px 0",
        color: "#1f2937",
        fontSize: "20px",
    },

    formRow: {
        display: "flex",
        alignItems: "flex-end",
        gap: "15px",
        flexWrap: "wrap",
    },

    field: {
        display: "flex",
        flexDirection: "column",
        gap: "7px",
        minWidth: "180px",
    },

    input: {
        padding: "10px 12px",
        border: "1px solid #d1d5db",
        borderRadius: "7px",
        fontSize: "14px",
        background: "#ffffff",
    },

    primaryButton: {
        padding: "11px 18px",
        border: "none",
        borderRadius: "7px",
        background: "#2563eb",
        color: "#ffffff",
        fontWeight: "600",
        cursor: "pointer",
    },

    secondaryButton: {
        padding: "11px 18px",
        border: "1px solid #d1d5db",
        borderRadius: "7px",
        background: "#ffffff",
        color: "#374151",
        fontWeight: "600",
        cursor: "pointer",
    },

    refreshButton: {
        padding: "10px 18px",
        border: "1px solid #d1d5db",
        borderRadius: "7px",
        background: "#ffffff",
        cursor: "pointer",
        fontWeight: "600",
    },

    deleteButton: {
        padding: "7px 12px",
        border: "none",
        borderRadius: "6px",
        background: "#dc2626",
        color: "#ffffff",
        cursor: "pointer",
    },

    tableHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },

    tableWrapper: {
        overflowX: "auto",
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
    },

    th: {
        textAlign: "left",
        padding: "12px",
        background: "#f3f4f6",
        color: "#374151",
        fontSize: "13px",
        borderBottom: "1px solid #e5e7eb",
    },

    td: {
        padding: "12px",
        borderBottom: "1px solid #e5e7eb",
        color: "#374151",
        fontSize: "14px",
    },

    status: {
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "700",
    },

    assigned: {
        background: "#dcfce7",
        color: "#166534",
    },

    leave: {
        background: "#fef3c7",
        color: "#92400e",
    },

    off: {
        background: "#e5e7eb",
        color: "#374151",
    },

    success: {
        background: "#dcfce7",
        color: "#166534",
        padding: "12px 15px",
        borderRadius: "8px",
        marginBottom: "20px",
    },

    error: {
        background: "#fee2e2",
        color: "#991b1b",
        padding: "12px 15px",
        borderRadius: "8px",
        marginBottom: "20px",
    },

    empty: {
        textAlign: "center",
        padding: "40px",
        color: "#6b7280",
    },
};

export default RosterManagement;