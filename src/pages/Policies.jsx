import React, { useEffect, useState } from "react";

const API = "http://localhost:8080";

function Policies() {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [form, setForm] = useState({
        policyName: "",
        maxWeeklyHours: "",
        maxConsecutiveDays: "",
        minRestHours: "",
        newJoinerMonths: "",
        newJoinerMorningOnly: false,
        nightShiftRestriction: false,
        allowNightShiftForRestrictedEmployees: false,
    });

    const token = localStorage.getItem("token");

    const loadPolicies = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(`${API}/api/policies`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error("Failed to load policies");
            }

            const data = await response.json();
            setPolicies(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPolicies();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError("");
            setSuccess("");

            const response = await fetch(`${API}/api/policies`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    policyName: form.policyName,
                    maxWeeklyHours: Number(form.maxWeeklyHours),
                    maxConsecutiveDays: Number(
                        form.maxConsecutiveDays
                    ),
                    minRestHours: Number(form.minRestHours),
                    newJoinerMonths: Number(
                        form.newJoinerMonths
                    ),
                    newJoinerMorningOnly:
                    form.newJoinerMorningOnly,
                    nightShiftRestriction:
                    form.nightShiftRestriction,
                    allowNightShiftForRestrictedEmployees:
                    form.allowNightShiftForRestrictedEmployees,
                }),
            });

            if (!response.ok) {
                const message = await response.text();
                throw new Error(
                    message || "Failed to create policy"
                );
            }

            setSuccess("Policy created successfully.");

            setForm({
                policyName: "",
                maxWeeklyHours: "",
                maxConsecutiveDays: "",
                minRestHours: "",
                newJoinerMonths: "",
                newJoinerMorningOnly: false,
                nightShiftRestriction: false,
                allowNightShiftForRestrictedEmployees: false,
            });

            loadPolicies();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this policy?")) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            const response = await fetch(
                `${API}/api/policies/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                const message = await response.text();
                throw new Error(
                    message || "Failed to delete policy"
                );
            }

            setSuccess("Policy deleted successfully.");
            loadPolicies();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "30px" }}>
                <h2>Policies</h2>
                <p>Loading policies...</p>
            </div>
        );
    }

    return (
        <div
            style={{
                padding: "30px",
                maxWidth: "1100px",
                margin: "0 auto",
            }}
        >
            <h1>Workforce Policies</h1>

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

            {success && (
                <div
                    style={{
                        background: "#e5f7e5",
                        color: "#176b17",
                        padding: "12px",
                        borderRadius: "8px",
                        marginBottom: "20px",
                    }}
                >
                    {success}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "20px",
                    marginBottom: "30px",
                }}
            >
                <h2>Create Policy</h2>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "15px",
                    }}
                >
                    <input
                        name="policyName"
                        placeholder="Policy Name"
                        value={form.policyName}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="maxWeeklyHours"
                        type="number"
                        min="1"
                        placeholder="Max Weekly Hours"
                        value={form.maxWeeklyHours}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="maxConsecutiveDays"
                        type="number"
                        min="1"
                        placeholder="Max Consecutive Days"
                        value={form.maxConsecutiveDays}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="minRestHours"
                        type="number"
                        min="0"
                        placeholder="Minimum Rest Hours"
                        value={form.minRestHours}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="newJoinerMonths"
                        type="number"
                        min="0"
                        placeholder="New Joiner Months"
                        value={form.newJoinerMonths}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div style={{ marginTop: "20px" }}>
                    <label>
                        <input
                            type="checkbox"
                            name="newJoinerMorningOnly"
                            checked={
                                form.newJoinerMorningOnly
                            }
                            onChange={handleChange}
                        />
                        {" "}New joiners morning shift only
                    </label>
                </div>

                <div style={{ marginTop: "10px" }}>
                    <label>
                        <input
                            type="checkbox"
                            name="nightShiftRestriction"
                            checked={
                                form.nightShiftRestriction
                            }
                            onChange={handleChange}
                        />
                        {" "}Enable night shift restriction
                    </label>
                </div>

                <div style={{ marginTop: "10px" }}>
                    <label>
                        <input
                            type="checkbox"
                            name="allowNightShiftForRestrictedEmployees"
                            checked={
                                form.allowNightShiftForRestrictedEmployees
                            }
                            onChange={handleChange}
                        />
                        {" "}Allow night shift for restricted employees
                    </label>
                </div>

                <button
                    type="submit"
                    style={{
                        marginTop: "20px",
                        padding: "10px 18px",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    Create Policy
                </button>
            </form>

            <h2>Existing Policies</h2>

            {policies.length === 0 ? (
                <p>No policies found.</p>
            ) : (
                policies.map((policy) => (
                    <div
                        key={policy.id}
                        style={{
                            border: "1px solid #ddd",
                            borderRadius: "10px",
                            padding: "20px",
                            marginBottom: "15px",
                        }}
                    >
                        <h3>{policy.policyName}</h3>

                        <p>
                            <strong>Maximum weekly hours:</strong>{" "}
                            {policy.maxWeeklyHours}
                        </p>

                        <p>
                            <strong>Maximum consecutive days:</strong>{" "}
                            {policy.maxConsecutiveDays}
                        </p>

                        <p>
                            <strong>Minimum rest hours:</strong>{" "}
                            {policy.minRestHours}
                        </p>

                        <p>
                            <strong>New joiner months:</strong>{" "}
                            {policy.newJoinerMonths}
                        </p>

                        <p>
                            <strong>Morning shift only:</strong>{" "}
                            {policy.newJoinerMorningOnly
                                ? "Yes"
                                : "No"}
                        </p>

                        <p>
                            <strong>Night shift restriction:</strong>{" "}
                            {policy.nightShiftRestriction
                                ? "Yes"
                                : "No"}
                        </p>

                        <p>
                            <strong>
                                Allow night shift for restricted employees:
                            </strong>{" "}
                            {policy.allowNightShiftForRestrictedEmployees
                                ? "Yes"
                                : "No"}
                        </p>

                        <button
                            onClick={() =>
                                handleDelete(policy.id)
                            }
                            style={{
                                padding: "8px 14px",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                            }}
                        >
                            Delete
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}

export default Policies;