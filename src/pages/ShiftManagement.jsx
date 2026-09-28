import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/shifts";

const emptyForm = {
    shiftName: "",
    startTime: "",
    endTime: "",
    duration: "",
    status: "ACTIVE",
};

function ShiftManagement() {
    const [shifts, setShifts] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem("token");

    useEffect(() => {
        loadShifts();
    }, []);

    const loadShifts = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(API_URL, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to load shifts");
            }

            const data = await response.json();
            setShifts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const calculateDuration = (startTime, endTime) => {
        if (!startTime || !endTime) {
            return "";
        }

        const [startHour, startMinute] = startTime.split(":").map(Number);
        const [endHour, endMinute] = endTime.split(":").map(Number);

        let startMinutes = startHour * 60 + startMinute;
        let endMinutes = endHour * 60 + endMinute;

        // Handles overnight shifts
        if (endMinutes <= startMinutes) {
            endMinutes += 24 * 60;
        }

        const duration = (endMinutes - startMinutes) / 60;

        return duration.toFixed(2);
    };

    const handleTimeChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => {
            const updated = {
                ...prev,
                [name]: value,
            };

            updated.duration = calculateDuration(
                updated.startTime,
                updated.endTime
            );

            return updated;
        });
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (!form.shiftName.trim()) {
            setError("Shift name is required.");
            return;
        }

        if (!form.startTime || !form.endTime) {
            setError("Start time and end time are required.");
            return;
        }

        const duration = calculateDuration(
            form.startTime,
            form.endTime
        );

        if (!duration || Number(duration) <= 0) {
            setError("Invalid shift time.");
            return;
        }

        try {
            const url = editingId
                ? `${API_URL}/${editingId}`
                : API_URL;

            const method = editingId ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    shiftName: form.shiftName.trim(),
                    startTime: form.startTime,
                    endTime: form.endTime,
                    duration: Number(duration),
                    status: form.status,
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(
                    text || "Failed to save shift"
                );
            }

            if (editingId) {
                setMessage("Shift updated successfully.");
            } else {
                setMessage("Shift created successfully.");
            }

            setForm(emptyForm);
            setEditingId(null);

            await loadShifts();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (shift) => {
        setMessage("");
        setError("");

        setEditingId(shift.id);

        setForm({
            shiftName: shift.shiftName || "",
            startTime: shift.startTime
                ? shift.startTime.substring(0, 5)
                : "",
            endTime: shift.endTime
                ? shift.endTime.substring(0, 5)
                : "",
            duration:
                shift.duration !== null &&
                shift.duration !== undefined
                    ? String(shift.duration)
                    : "",
            status: shift.status || "ACTIVE",
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this shift?"
        );

        if (!confirmed) {
            return;
        }

        setMessage("");
        setError("");

        try {
            const response = await fetch(
                `${API_URL}/${id}`,
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
                    text || "Failed to delete shift"
                );
            }

            setMessage("Shift deleted successfully.");

            await loadShifts();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div
            style={{
                padding: "30px",
                maxWidth: "1200px",
                margin: "0 auto",
            }}
        >
            <h1>Shift Management</h1>

            <p style={{ color: "#666" }}>
                Create, update, and manage workforce shifts.
            </p>

            {message && (
                <div
                    style={{
                        padding: "12px",
                        marginBottom: "15px",
                        background: "#d4edda",
                        color: "#155724",
                        borderRadius: "6px",
                    }}
                >
                    {message}
                </div>
            )}

            {error && (
                <div
                    style={{
                        padding: "12px",
                        marginBottom: "15px",
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
                    background: "#fff",
                    padding: "25px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    marginBottom: "30px",
                }}
            >
                <h2>
                    {editingId ? "Edit Shift" : "Add Shift"}
                </h2>

                <form onSubmit={handleSubmit}>
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns:
                                "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "15px",
                        }}
                    >
                        <div>
                            <label>Shift Name</label>
                            <input
                                type="text"
                                name="shiftName"
                                value={form.shiftName}
                                onChange={handleChange}
                                placeholder="e.g. Morning Shift"
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Start Time</label>
                            <input
                                type="time"
                                name="startTime"
                                value={form.startTime}
                                onChange={handleTimeChange}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>End Time</label>
                            <input
                                type="time"
                                name="endTime"
                                value={form.endTime}
                                onChange={handleTimeChange}
                                style={inputStyle}
                            />
                        </div>

                        <div>
                            <label>Duration (Hours)</label>
                            <input
                                type="number"
                                value={form.duration}
                                readOnly
                                style={{
                                    ...inputStyle,
                                    background: "#f5f5f5",
                                }}
                            />
                        </div>

                        <div>
                            <label>Status</label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                style={inputStyle}
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginTop: "20px" }}>
                        <button
                            type="submit"
                            style={primaryButton}
                        >
                            {editingId
                                ? "Update Shift"
                                : "Create Shift"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                style={secondaryButton}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div
                style={{
                    background: "#fff",
                    padding: "25px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
            >
                <h2>
                    Shift List ({shifts.length})
                </h2>

                {loading ? (
                    <p>Loading shifts...</p>
                ) : shifts.length === 0 ? (
                    <p>No shifts found.</p>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table
                            style={{
                                width: "100%",
                                borderCollapse: "collapse",
                                marginTop: "15px",
                            }}
                        >
                            <thead>
                            <tr>
                                <th style={thStyle}>ID</th>
                                <th style={thStyle}>Shift Name</th>
                                <th style={thStyle}>Start Time</th>
                                <th style={thStyle}>End Time</th>
                                <th style={thStyle}>Duration</th>
                                <th style={thStyle}>Status</th>
                                <th style={thStyle}>Actions</th>
                            </tr>
                            </thead>

                            <tbody>
                            {shifts.map((shift) => (
                                <tr key={shift.id}>
                                    <td style={tdStyle}>
                                        {shift.id}
                                    </td>

                                    <td style={tdStyle}>
                                        {shift.shiftName}
                                    </td>

                                    <td style={tdStyle}>
                                        {shift.startTime}
                                    </td>

                                    <td style={tdStyle}>
                                        {shift.endTime}
                                    </td>

                                    <td style={tdStyle}>
                                        {shift.duration} hrs
                                    </td>

                                    <td style={tdStyle}>
                                        {shift.status}
                                    </td>

                                    <td style={tdStyle}>
                                        <button
                                            onClick={() =>
                                                handleEdit(shift)
                                            }
                                            style={editButton}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDelete(shift.id)
                                            }
                                            style={deleteButton}
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

const inputStyle = {
    width: "100%",
    padding: "10px",
    marginTop: "6px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    boxSizing: "border-box",
};

const primaryButton = {
    padding: "10px 18px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    background: "#2563eb",
    color: "#fff",
    marginRight: "10px",
};

const secondaryButton = {
    padding: "10px 18px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    cursor: "pointer",
    background: "#fff",
};

const editButton = {
    padding: "7px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "8px",
    background: "#f59e0b",
    color: "#fff",
};

const deleteButton = {
    padding: "7px 12px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    background: "#dc2626",
    color: "#fff",
};

const thStyle = {
    padding: "12px",
    borderBottom: "2px solid #ddd",
    textAlign: "left",
};

const tdStyle = {
    padding: "12px",
    borderBottom: "1px solid #eee",
};

export default ShiftManagement;