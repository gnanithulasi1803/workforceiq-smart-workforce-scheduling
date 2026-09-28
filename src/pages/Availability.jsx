
import React, { useEffect, useState } from "react";

export default function Availability() {
    const username = localStorage.getItem("username") || "Employee";
    const token = localStorage.getItem("token");

    const [employee, setEmployee] = useState(null);
    const [availabilities, setAvailabilities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        date: "",
        available: true,
        reason: "",
    });

    useEffect(() => {
        loadAvailability();
    }, []);

    const loadAvailability = async () => {
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

            const availabilityResponse = await fetch(
                `http://localhost:8080/api/availability/employee/${currentEmployee.id}`,
{
    headers: {
        Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
    },
}
);

if (!availabilityResponse.ok) {
    throw new Error("Failed to load availability");
}

const data = await availabilityResponse.json();

setAvailabilities(Array.isArray(data) ? data : []);
} catch (err) {
    console.error("Availability error:", err);
    setError(err.message || "Unable to load availability");
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

    if (!form.date) {
        setError("Please select a date");
        return;
    }

    try {
        setSaving(true);
        setError("");
        setSuccess("");

        const response = await fetch(
            "http://localhost:8080/api/availability",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    employeeId: employee.id,
                    date: form.date,
                    availabilityStatus:
                        form.available === true || form.available === "true"
                            ? "AVAILABLE"
                            : "UNAVAILABLE",
                    reason: form.reason,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to save availability"
            );
        }

        setSuccess("Availability saved successfully.");

        setForm({
            date: "",
            available: true,
            reason: "",
        });

        await loadAvailability();
    } catch (err) {
        console.error("Save availability error:", err);
        setError(
            err.message || "Unable to save availability"
        );
    } finally {
        setSaving(false);
    }
};

const handleDelete = async (id) => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this availability entry?"
    );

    if (!confirmed) {
        return;
    }

    try {
        setError("");
        setSuccess("");

        const response = await fetch(
            `http://localhost:8080/api/availability/${id}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            const message = await response.text();
            throw new Error(
                message || "Failed to delete availability"
            );
        }

        setSuccess("Availability deleted successfully.");

        await loadAvailability();
    } catch (err) {
        console.error("Delete availability error:", err);
        setError(
            err.message || "Unable to delete availability"
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
                My Availability
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
                    Loading availability...
                </div>
            )}

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

            {!loading && (
                <>
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
                            Add Availability
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
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        name="date"
                                        value={form.date}
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
                                        Availability
                                    </label>

                                    <select
                                        name="available"
                                        value={form.available}
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
                                        <option value={true}>
                                            Available
                                        </option>

                                        <option value={false}>
                                            Not Available
                                        </option>
                                    </select>
                                </div>
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
                                    ? "Saving..."
                                    : "Save Availability"}
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
                                My Availability
                            </h2>
                        </div>

                        {availabilities.length === 0 ? (
                            <div
                                style={{
                                    padding: "40px",
                                    textAlign: "center",
                                    color: "#6b7280",
                                }}
                            >
                                No availability entries found.
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
                                            Date
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
                                    {availabilities.map(
                                        (item) => (
                                            <tr
                                                key={
                                                    item.id
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
                                                        item.date
                                                    )}
                                                </td>

                                                <td
                                                    style={{
                                                        padding:
                                                            "15px",
                                                    }}
                                                >
                                                    {item.availabilityStatus === "AVAILABLE"
                                                        ? "Available"
                                                        : "Not Available"}
                                                </td>

                                                <td
                                                    style={{
                                                        padding:
                                                            "15px",
                                                    }}
                                                >
                                                    {item.reason ||
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
                                                                item.id
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
                                        )
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    </div>
);
}
