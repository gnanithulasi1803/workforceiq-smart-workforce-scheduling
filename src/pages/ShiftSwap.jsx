import React, { useEffect, useState } from "react";

function ShiftSwap() {
    const username = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    const [employee, setEmployee] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [myRoster, setMyRoster] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
    const [selectedMyShiftId, setSelectedMyShiftId] = useState("");
    const [selectedTargetShiftId, setSelectedTargetShiftId] = useState("");
    const [swapDate, setSwapDate] = useState("");
    const [reason, setReason] = useState("");

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const employeeResponse = await fetch(
                "http://localhost:8080/api/employees",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!employeeResponse.ok) {
                throw new Error("Failed to load employees");
            }

            const employeeData = await employeeResponse.json();

            const currentEmployee = employeeData.find(
                (emp) => emp.employeeCode === username
            );

            if (!currentEmployee) {
                throw new Error("Logged-in employee not found");
            }

            setEmployee(currentEmployee);

            const otherEmployees = employeeData.filter(
                (emp) => emp.id !== currentEmployee.id
            );

            setEmployees(otherEmployees);

            const rosterResponse = await fetch(
                `http://localhost:8080/api/rosters/employee/${currentEmployee.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (rosterResponse.ok) {
                const rosterData = await rosterResponse.json();

                const assigned = rosterData.filter(
                    (roster) =>
                        roster.status &&
                        roster.status.toUpperCase() === "ASSIGNED"
                );

                setMyRoster(assigned);
            }

            const swapResponse = await fetch(
                `http://localhost:8080/api/shift-swaps/requester/${currentEmployee.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (swapResponse.ok) {
                const swapData = await swapResponse.json();
                setRequests(swapData);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const submitRequest = async (e) => {
        e.preventDefault();

        setMessage("");
        setError("");

        if (
            !selectedEmployeeId ||
            !selectedMyShiftId ||
            !selectedTargetShiftId ||
            !swapDate
        ) {
            setError("Please fill in all required fields.");
            return;
        }

        try {
            const params = new URLSearchParams({
                requesterId: employee.id,
                targetEmployeeId: selectedEmployeeId,
                requesterShiftId: selectedMyShiftId,
                targetShiftId: selectedTargetShiftId,
                swapDate: swapDate,
            });

            if (reason.trim()) {
                params.append("reason", reason.trim());
            }

            const response = await fetch(
                `http://localhost:8080/api/shift-swaps?${params.toString()}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to create shift swap request"
                );
            }

            setMessage("Shift swap request submitted successfully.");

            setSelectedEmployeeId("");
            setSelectedMyShiftId("");
            setSelectedTargetShiftId("");
            setSwapDate("");
            setReason("");

            loadData();
        } catch (err) {
            setError(err.message);
        }
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <div style={{ padding: "30px" }}>
                <h2>Shift Swap</h2>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: "30px" }}>
            <h2 style={{ marginBottom: "8px" }}>Shift Swap</h2>

            <p style={{ color: "#666", marginBottom: "25px" }}>
                Request a shift exchange with another employee.
            </p>

            {message && (
                <div
                    style={{
                        padding: "12px",
                        marginBottom: "20px",
                        background: "#e8f5e9",
                        color: "#2e7d32",
                        borderRadius: "8px",
                    }}
                >
                    {message}
                </div>
            )}

            {error && (
                <div
                    style={{
                        padding: "12px",
                        marginBottom: "20px",
                        background: "#ffebee",
                        color: "#c62828",
                        borderRadius: "8px",
                    }}
                >
                    {error}
                </div>
            )}

            <div
                style={{
                    background: "#fff",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                    marginBottom: "30px",
                }}
            >
                <h3 style={{ marginTop: 0 }}>Create Swap Request</h3>

                <form onSubmit={submitRequest}>
                    <div style={{ marginBottom: "15px" }}>
                        <label>My Shift</label>

                        <select
                            value={selectedMyShiftId}
                            onChange={(e) => {
                                const selectedRoster = myRoster.find(
                                    (roster) =>
                                        String(roster.shift?.id) === e.target.value
                                );

                                setSelectedMyShiftId(e.target.value);

                                if (selectedRoster?.rosterDate) {
                                    setSwapDate(selectedRoster.rosterDate);
                                }
                            }}
                            style={inputStyle}
                        >
                            <option value="">Select my shift</option>

                            {myRoster.map((roster) => (
                                <option key={roster.id} value={roster.shift?.id}>
                                    {formatDate(roster.rosterDate)} — Shift ID {roster.shift?.id}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label>Swap With Employee</label>

                        <select
                            value={selectedEmployeeId}
                            onChange={(e) => {
                                setSelectedEmployeeId(e.target.value);
                                setSelectedTargetShiftId("");
                            }}
                            style={inputStyle}
                        >
                            <option value="">Select employee</option>

                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.employeeCode} — {emp.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label>Target Shift ID</label>

                        <input
                            type="number"
                            value={selectedTargetShiftId}
                            onChange={(e) =>
                                setSelectedTargetShiftId(e.target.value)
                            }
                            placeholder="Enter target shift ID"
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ marginBottom: "15px" }}>
                        <label>Swap Date</label>

                        <input
                            type="date"
                            value={swapDate}
                            onChange={(e) => setSwapDate(e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                        <label>Reason</label>

                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Optional reason"
                            rows="3"
                            style={{
                                ...inputStyle,
                                resize: "vertical",
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        style={{
                            padding: "12px 20px",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            background: "#1976d2",
                            color: "#fff",
                        }}
                    >
                        Submit Swap Request
                    </button>
                </form>
            </div>

            <div
                style={{
                    background: "#fff",
                    padding: "25px",
                    borderRadius: "12px",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                }}
            >
                <h3 style={{ marginTop: 0 }}>My Swap Requests</h3>

                {requests.length === 0 ? (
                    <p style={{ color: "#777" }}>
                        No shift swap requests found.
                    </p>
                ) : (
                    <div>
                        {requests.map((request) => (
                            <div
                                key={request.id}
                                style={{
                                    padding: "15px",
                                    borderBottom: "1px solid #eee",
                                }}
                            >
                                <strong>
                                    Swap Request #{request.id}
                                </strong>

                                <p style={{ margin: "8px 0" }}>
                                    Date: {formatDate(request.swapDate)}
                                </p>

                                <p style={{ margin: "8px 0" }}>
                                    Status:{" "}
                                    {request.status ||
                                        request.swapStatus ||
                                        "PENDING"}
                                </p>

                                {request.reason && (
                                    <p style={{ margin: "8px 0" }}>
                                        Reason: {request.reason}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const inputStyle = {
    display: "block",
    width: "100%",
    boxSizing: "border-box",
    marginTop: "6px",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "6px",
};

export default ShiftSwap;