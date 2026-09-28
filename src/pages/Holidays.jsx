import React, { useEffect, useState } from "react";

const API = "http://localhost:8080";

function Holidays() {
    const [holidays, setHolidays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const canManageHolidays =
        role === "ADMIN" || role === "MANAGER";

    const [form, setForm] = useState({
        holidayName: "",
        holidayDate: "",
        optional: false,
        description: "",
    });

    const loadHolidays = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API}/api/holidays`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to load holidays");
            }

            const data = await response.json();
            setHolidays(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHolidays();
    }, []);

    const handleFormChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleAddHoliday = async (event) => {
        event.preventDefault();

        if (!form.holidayName.trim() || !form.holidayDate) {
            setError("Holiday name and date are required");
            return;
        }

        try {
            setSaving(true);
            setError("");

            const response = await fetch(`${API}/api/holidays`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    holidayName: form.holidayName.trim(),
                    holidayDate: form.holidayDate,
                    optional: form.optional,
                    description: form.description.trim(),
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to add holiday"
                );
            }

            setForm({
                holidayName: "",
                holidayDate: "",
                optional: false,
                description: "",
            });

            setShowForm(false);
            await loadHolidays();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "30px" }}>
                <h2>Holidays</h2>
                <p>Loading holidays...</p>
            </div>
        );
    }

    return (
        <div
            style={{
                padding: "30px",
                maxWidth: "1000px",
                margin: "0 auto",
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
                <h1 style={{ margin: 0 }}>Holidays</h1>

                {canManageHolidays && (
                    <button
                        type="button"
                        onClick={() => {
                            setShowForm((previous) => !previous);
                            setError("");
                        }}
                        style={{
                            padding: "10px 18px",
                            border: "none",
                            borderRadius: "8px",
                            background: "#2563eb",
                            color: "#fff",
                            cursor: "pointer",
                            fontWeight: "600",
                        }}
                    >
                        {showForm ? "Cancel" : "+ Add Holiday"}
                    </button>
                )}
            </div>

            {canManageHolidays && showForm && (
                <form
                    onSubmit={handleAddHoliday}
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "20px",
                        marginBottom: "25px",
                        background: "#f8fafc",
                    }}
                >
                    <h2 style={{ marginTop: 0 }}>Add Holiday</h2>

                    <div style={{ marginBottom: "14px" }}>
                        <label>
                            <strong>Holiday Name</strong>
                        </label>

                        <input
                            name="holidayName"
                            value={form.holidayName}
                            onChange={handleFormChange}
                            placeholder="e.g. Gandhi Jayanti"
                            style={{
                                width: "100%",
                                padding: "10px",
                                marginTop: "6px",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "14px" }}>
                        <label>
                            <strong>Date</strong>
                        </label>

                        <input
                            type="date"
                            name="holidayDate"
                            value={form.holidayDate}
                            onChange={handleFormChange}
                            style={{
                                width: "100%",
                                padding: "10px",
                                marginTop: "6px",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: "14px" }}>
                        <label>
                            <input
                                type="checkbox"
                                name="optional"
                                checked={form.optional}
                                onChange={handleFormChange}
                                style={{ marginRight: "8px" }}
                            />
                            Optional Holiday
                        </label>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                        <label>
                            <strong>Description</strong>
                        </label>

                        <textarea
                            name="description"
                            value={form.description}
                            onChange={handleFormChange}
                            placeholder="Holiday description"
                            rows="3"
                            style={{
                                width: "100%",
                                padding: "10px",
                                marginTop: "6px",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            padding: "10px 18px",
                            border: "none",
                            borderRadius: "8px",
                            background: "#16a34a",
                            color: "#fff",
                            cursor: saving
                                ? "not-allowed"
                                : "pointer",
                            fontWeight: "600",
                        }}
                    >
                        {saving ? "Saving..." : "Save Holiday"}
                    </button>
                </form>
            )}

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

            {holidays.length === 0 ? (
                <p>No holidays found.</p>
            ) : (
                holidays.map((holiday) => (
                    <div
                        key={holiday.id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            padding: "18px",
                            marginBottom: "15px",
                        }}
                    >
                        <h3>
                            {holiday.holidayName ||
                                holiday.name ||
                                "Holiday"}
                        </h3>

                        <p>
                            <strong>Date:</strong>{" "}
                            {holiday.holidayDate || "N/A"}
                        </p>

                        <p>
                            <strong>Optional:</strong>{" "}
                            {holiday.optional === true
                                ? "Yes"
                                : holiday.optional === false
                                    ? "No"
                                    : "N/A"}
                        </p>

                        <p>
                            <strong>Description:</strong>{" "}
                            {holiday.description || "N/A"}
                        </p>
                    </div>
                ))
            )}
        </div>
    );
}

export default Holidays;