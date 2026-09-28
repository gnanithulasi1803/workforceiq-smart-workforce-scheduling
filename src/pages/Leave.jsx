
import React, { useEffect, useState } from "react";

export default function Leave() {
    const username = localStorage.getItem("username") || "Employee";
    const token = localStorage.getItem("token");

    const [employee, setEmployee] = useState(null);
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        startDate: "",
        endDate: "",
        leaveType: "ANNUAL",
        reason: "",
    });

    useEffect(() => {
        loadLeaves();
    }, []);

    const loadLeaves = async () => {
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

            const leaveResponse = await fetch(
                `http://localhost:8080/api/leaves/employee/${currentEmployee.id}`,
{
    headers: {
        Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
    },
}
);

if (!leaveResponse.ok) {
    throw new Error("Failed to load leave requests");
}

const data = await leaveResponse.json();

setLeaves(Array.isArray(data) ? data : []);
} catch (err) {
    console.error("Leave loading error:", err);
    setError(err.message || "Unable to load leave requests");
} finally {
    setLoading(false);
}
};

const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
        ...previous,
        [name]: value,
    }));
};

const handleSubmit = async (event) => {
    event.preventDefault();

    if (!employee) {
        setError("Employee information is not available");
        return;
    }

    if (!form.startDate || !form.endDate) {
        setError("Please select both start and end dates");
        return;
    }

    if (form.endDate < form.startDate) {
        setError("End date cannot be before start date");
        return;
    }

    try {
        setSaving(true);
        setError("");
        setSuccess("");

        const params = new URLSearchParams();

        params.append("employeeId", employee.id);
        params.append("startDate", form.startDate);
        params.append("endDate", form.endDate);
        params.append("leaveType", form.leaveType);

        if (form.reason.trim()) {
            params.append("reason", form.reason.trim());
        }

        const response = await fetch(
            `http://localhost:8080/api/leaves?${params.toString()}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            const text = await response.text();

            let message = "Failed to apply for leave";

            try {
                const data = JSON.parse(text);
                message = data.message || message;
            } catch {
                if (text) {
                    message = text;
                }
            }

            throw new Error(message);
        }

        setSuccess("Leave request submitted successfully.");

        setForm({
            startDate: "",
            endDate: "",
            leaveType: "ANNUAL",
            reason: "",
        });

        await loadLeaves();
    } catch (err) {
        console.error("Leave submission error:", err);
        setError(
            err.message || "Unable to submit leave request"
        );
    } finally {
        setSaving(false);
    }
};

const handleDelete = async (id) => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this leave request?"
    );

    if (!confirmed) {
        return;
    }

    try {
        setError("");
        setSuccess("");

        const response = await fetch(
            `http://localhost:8080/api/leaves/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            const text = await response.text();

            throw new Error(
                text || "Failed to delete leave request"
            );
        }

        setSuccess("Leave request deleted successfully.");

        await loadLeaves();
    } catch (err) {
        console.error("Delete leave error:", err);
        setError(
            err.message || "Unable to delete leave request"
        );
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

const getStatus = (leave) => {
    return (
        leave.status ||
        leave.leaveStatus ||
        "PENDING"
    ).toString().toUpperCase();
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
                My Leave
            </h1>

            <p style={{ color: "#6b7280" }}>
                {employee
                    ? `${employee.firstName || ""} ${
                        employee.lastName || ""
                    } • ${employee.employeeCode}`
                    : username}
            </p>

            {!loading && error && (
                <div
                    style={{
                        background: "#fee2e2",
                        color: "#b91c1c",
                        padding: "15px 20px",
                        borderRadius: "10px",
                        marginTop: "20px",
                    }}
                >
                    {error}
                </div>
            )}

            {!loading && success && (
                <div
                    style={{
                        background: "#dcfce7",
                        color: "#166534",
                        padding: "15px 20px",
                        borderRadius: "10px",
                        marginTop: "20px",
                    }}
                >
                    {success}
                </div>
            )}

            <div
                style={{
                    background: "#ffffff",
                    padding: "25px",
                    borderRadius: "12px",
                    marginTop: "25px",
                    boxShadow:
                        "0 2px 8px rgba(0,0,0,0.06)",
                }}
            >
                <h2 style={{ marginTop: 0 }}>
                    Apply for Leave
                </h2>

                <form onSubmit={handleSubmit}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "1fr 1fr",
                            gap: "20px",
                        }}
                    >
                        <div>
                            <label>
                                Start Date
                            </label>

                            <input
                                type="date"
                                name="startDate"
                                value={form.startDate}
                                onChange={handleChange}
                                required
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    marginTop: "6px",
                                    border:
                                        "1px solid #d1d5db",
                                    borderRadius: "8px",
                                    boxSizing:
                                        "border-box",
                                }}
                            />
                        </div>

                        <div>
                            <label>
                                End Date
                            </label>

                            <input
                                type="date"
                                name="endDate"
                                value={form.endDate}
                                onChange={handleChange}
                                required
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    marginTop: "6px",
                                    border:
                                        "1px solid #d1d5db",
                                    borderRadius: "8px",
                                    boxSizing:
                                        "border-box",
                                }}
                            />
                        </div>
                    </div>

                    <div
                        style={{
                            marginTop: "20px",
                        }}
                    >
                        <label>
                            Leave Type
                        </label>

                        <select
                            name="leaveType"
                            value={form.leaveType}
                            onChange={handleChange}
                            style={{
                                width: "100%",
                                padding: "12px",
                                marginTop: "6px",
                                border:
                                    "1px solid #d1d5db",
                                borderRadius: "8px",
                                boxSizing:
                                    "border-box",
                            }}
                        >
                            <option value="ANNUAL">
                                Annual Leave
                            </option>

                            <option value="SICK">
                                Sick Leave
                            </option>

                            <option value="CASUAL">
                                Casual Leave
                            </option>

                            <option value="UNPAID">
                                Unpaid Leave
                            </option>
                        </select>
                    </div>

                    <div
                        style={{
                            marginTop: "20px",
                        }}
                    >
                        <label>
                            Reason
                        </label>

                        <textarea
                            name="reason"
                            value={form.reason}
                            onChange={handleChange}
                            placeholder="Optional reason"
                            rows="3"
                            style={{
                                width: "100%",
                                padding: "12px",
                                marginTop: "6px",
                                border:
                                    "1px solid #d1d5db",
                                borderRadius: "8px",
                                boxSizing:
                                    "border-box",
                                resize: "vertical",
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            marginTop: "20px",
                            padding:
                                "12px 24px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: saving
                                ? "not-allowed"
                                : "pointer",
                            background:
                                "#2563eb",
                            color: "#ffffff",
                            fontWeight: "bold",
                        }}
                    >
                        {saving
                            ? "Submitting..."
                            : "Submit Leave Request"}
                    </button>
                </form>
            </div>

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
                        My Leave Requests
                    </h2>
                </div>

                {loading ? (
                    <div
                        style={{
                            padding: "40px",
                            textAlign: "center",
                            color: "#6b7280",
                        }}
                    >
                        Loading leave requests...
                    </div>
                ) : leaves.length === 0 ? (
                    <div
                        style={{
                            padding: "40px",
                            textAlign: "center",
                            color: "#6b7280",
                        }}
                    >
                        No leave requests found.
                    </div>
                ) : (
                    <div
                        style={{
                            overflowX: "auto",
                        }}
                    >
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
                                    textAlign:
                                        "left",
                                }}
                            >
                                <th
                                    style={{
                                        padding:
                                            "15px",
                                    }}
                                >
                                    Start Date
                                </th>

                                <th
                                    style={{
                                        padding:
                                            "15px",
                                    }}
                                >
                                    End Date
                                </th>

                                <th
                                    style={{
                                        padding:
                                            "15px",
                                    }}
                                >
                                    Type
                                </th>

                                <th
                                    style={{
                                        padding:
                                            "15px",
                                    }}
                                >
                                    Status
                                </th>

                                <th
                                    style={{
                                        padding:
                                            "15px",
                                    }}
                                >
                                    Reason
                                </th>

                                <th
                                    style={{
                                        padding:
                                            "15px",
                                    }}
                                >
                                    Action
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {leaves.map((leave) => (
                                <tr
                                    key={leave.id}
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
                                            leave.startDate
                                        )}
                                    </td>

                                    <td
                                        style={{
                                            padding:
                                                "15px",
                                        }}
                                    >
                                        {formatDate(
                                            leave.endDate
                                        )}
                                    </td>

                                    <td
                                        style={{
                                            padding:
                                                "15px",
                                        }}
                                    >
                                        {leave.leaveType ||
                                            "-"}
                                    </td>

                                    <td
                                        style={{
                                            padding:
                                                "15px",
                                            fontWeight:
                                                "bold",
                                        }}
                                    >
                                        {getStatus(
                                            leave
                                        )}
                                    </td>

                                    <td
                                        style={{
                                            padding:
                                                "15px",
                                        }}
                                    >
                                        {leave.reason ||
                                            "-"}
                                    </td>

                                    <td
                                        style={{
                                            padding:
                                                "15px",
                                        }}
                                    >
                                        <button
                                            onClick={() =>
                                                handleDelete(
                                                    leave.id
                                                )
                                            }
                                            style={{
                                                padding:
                                                    "8px 14px",
                                                border:
                                                    "none",
                                                borderRadius:
                                                    "6px",
                                                cursor:
                                                    "pointer",
                                                background:
                                                    "#fee2e2",
                                                color:
                                                    "#b91c1c",
                                            }}
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
    </div>
);
}

