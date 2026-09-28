import React, { useEffect, useState } from "react";

const API = "http://localhost:8080";

function Approvals() {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [swapRequests, setSwapRequests] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token");

    const headers = {
        Authorization: `Bearer ${token}`,
    };

    const loadApprovals = async () => {
        try {
            setLoading(true);
            setError("");

            const [leaveResponse, swapResponse] = await Promise.all([
                fetch(`${API}/api/leaves`, {
                    headers,
                }),
                fetch(`${API}/api/shift-swaps/pending`, {
                    headers,
                }),
            ]);

            if (!leaveResponse.ok) {
                throw new Error("Failed to load leave requests");
            }

            if (!swapResponse.ok) {
                throw new Error("Failed to load shift swap requests");
            }

            const leaves = await leaveResponse.json();
            const swaps = await swapResponse.json();

            const pendingLeaves = leaves.filter(
                (leave) =>
                    String(
                        leave.status ||
                        leave.leaveStatus ||
                        "PENDING"
                    ).toUpperCase() === "PENDING"
            );

            setLeaveRequests(pendingLeaves);
            setSwapRequests(swaps);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadApprovals();
    }, []);

    const approveLeave = async (id) => {
        try {
            setError("");
            setMessage("");

            const response = await fetch(
                `${API}/api/leaves/${id}/approve`,
                {
                    method: "PUT",
                    headers,
                }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Failed to approve leave");
            }

            setMessage("Leave request approved successfully.");
            loadApprovals();
        } catch (err) {
            setError(err.message);
        }
    };

    const rejectLeave = async (id) => {
        try {
            setError("");
            setMessage("");

            const response = await fetch(
                `${API}/api/leaves/${id}/reject`,
                {
                    method: "PUT",
                    headers,
                }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Failed to reject leave");
            }

            setMessage("Leave request rejected successfully.");
            loadApprovals();
        } catch (err) {
            setError(err.message);
        }
    };

    const approveSwap = async (id) => {
        try {
            setError("");
            setMessage("");

            const response = await fetch(
                `${API}/api/shift-swaps/${id}/approve`,
                {
                    method: "PUT",
                    headers,
                }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Failed to approve shift swap");
            }

            setMessage("Shift swap approved successfully.");
            loadApprovals();
        } catch (err) {
            setError(err.message);
        }
    };

    const rejectSwap = async (id) => {
        try {
            setError("");
            setMessage("");

            const response = await fetch(
                `${API}/api/shift-swaps/${id}/reject`,
                {
                    method: "PUT",
                    headers,
                }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Failed to reject shift swap");
            }

            setMessage("Shift swap rejected successfully.");
            loadApprovals();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: "30px" }}>
                <h2>Approvals</h2>
                <p>Loading approvals...</p>
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
            <h1>Approvals</h1>

            {error && (
                <div
                    style={{
                        background: "#ffe5e5",
                        color: "#b00020",
                        padding: "12px",
                        borderRadius: "8px",
                        marginBottom: "15px",
                    }}
                >
                    {error}
                </div>
            )}

            {message && (
                <div
                    style={{
                        background: "#e5f7e5",
                        color: "#187a18",
                        padding: "12px",
                        borderRadius: "8px",
                        marginBottom: "15px",
                    }}
                >
                    {message}
                </div>
            )}

            {/* Leave Approvals */}
            <section style={{ marginBottom: "40px" }}>
                <h2>Pending Leave Requests</h2>

                {leaveRequests.length === 0 ? (
                    <p>No pending leave requests.</p>
                ) : (
                    leaveRequests.map((leave) => (
                        <div
                            key={leave.id}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "10px",
                                padding: "18px",
                                marginBottom: "15px",
                            }}
                        >
                            <p>
                                <strong>Leave ID:</strong> {leave.id}
                            </p>

                            <p>
                                <strong>Employee ID:</strong>{" "}
                                {leave.employeeId ||
                                    leave.employee?.id ||
                                    "N/A"}
                            </p>

                            <p>
                                <strong>From:</strong>{" "}
                                {leave.startDate || "N/A"}
                            </p>

                            <p>
                                <strong>To:</strong>{" "}
                                {leave.endDate || "N/A"}
                            </p>

                            <p>
                                <strong>Type:</strong>{" "}
                                {leave.leaveType || "N/A"}
                            </p>

                            <p>
                                <strong>Reason:</strong>{" "}
                                {leave.reason || "N/A"}
                            </p>

                            <button
                                onClick={() => approveLeave(leave.id)}
                                style={{
                                    padding: "10px 16px",
                                    marginRight: "10px",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                Approve
                            </button>

                            <button
                                onClick={() => rejectLeave(leave.id)}
                                style={{
                                    padding: "10px 16px",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                Reject
                            </button>
                        </div>
                    ))
                )}
            </section>

            {/* Shift Swap Approvals */}
            <section>
                <h2>Pending Shift Swap Requests</h2>

                {swapRequests.length === 0 ? (
                    <p>No pending shift swap requests.</p>
                ) : (
                    swapRequests.map((swap) => (
                        <div
                            key={swap.id}
                            style={{
                                border: "1px solid #ddd",
                                borderRadius: "10px",
                                padding: "18px",
                                marginBottom: "15px",
                            }}
                        >
                            <p>
                                <strong>Swap ID:</strong> {swap.id}
                            </p>

                            <p>
                                <strong>Requester:</strong>{" "}
                                {swap.requesterId ||
                                    swap.requester?.id ||
                                    "N/A"}
                            </p>

                            <p>
                                <strong>Target Employee:</strong>{" "}
                                {swap.targetEmployeeId ||
                                    swap.targetEmployee?.id ||
                                    "N/A"}
                            </p>

                            <p>
                                <strong>Requester Shift:</strong>{" "}
                                {swap.requesterShiftId ||
                                    swap.requesterShift?.id ||
                                    "N/A"}
                            </p>

                            <p>
                                <strong>Target Shift:</strong>{" "}
                                {swap.targetShiftId ||
                                    swap.targetShift?.id ||
                                    "N/A"}
                            </p>

                            <p>
                                <strong>Swap Date:</strong>{" "}
                                {swap.swapDate || "N/A"}
                            </p>

                            <p>
                                <strong>Reason:</strong>{" "}
                                {swap.reason || "N/A"}
                            </p>

                            <button
                                onClick={() => approveSwap(swap.id)}
                                style={{
                                    padding: "10px 16px",
                                    marginRight: "10px",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                Approve
                            </button>

                            <button
                                onClick={() => rejectSwap(swap.id)}
                                style={{
                                    padding: "10px 16px",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                }}
                            >
                                Reject
                            </button>
                        </div>
                    ))
                )}
            </section>
        </div>
    );
}

export default Approvals;