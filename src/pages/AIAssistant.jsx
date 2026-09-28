import React, { useEffect, useState } from "react";

const API = "http://localhost:8080";

function AIAssistant() {
    const [data, setData] = useState({
        employees: [],
        rosters: [],
        leaves: [],
        holidays: [],
        swaps: [],
        policies: [],
    });

    const [messages, setMessages] = useState([
        {
            type: "ai",
            text: "Hello! I'm your Workforce AI Assistant. Ask me about employees, rosters, leaves, holidays, shift swaps, or policies.",
        },
    ]);

    const [question, setQuestion] = useState("");
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    const headers = {
        Authorization: `Bearer ${token}`,
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const endpoints = [
                    ["employees", "/api/employees"],
                    ["rosters", "/api/rosters"],
                    ["leaves", "/api/leaves"],
                    ["holidays", "/api/holidays"],
                    ["swaps", "/api/shift-swaps"],
                    ["policies", "/api/policies"],
                ];

                const results = await Promise.all(
                    endpoints.map(async ([key, endpoint]) => {
                        const response = await fetch(
                            `${API}${endpoint}`,
                            { headers }
                        );

                        if (!response.ok) {
                            throw new Error(
                                `Failed to load ${key}`
                            );
                        }

                        return [key, await response.json()];
                    })
                );

                setData(Object.fromEntries(results));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const getStatus = (item) =>
        String(
            item.status ||
            item.leaveStatus ||
            item.swapStatus ||
            ""
        ).toUpperCase();

    const generateAnswer = (input) => {
        const text = input.toLowerCase().trim();

        const employees = Array.isArray(data.employees)
            ? data.employees
            : [];

        const rosters = Array.isArray(data.rosters)
            ? data.rosters
            : [];

        const leaves = Array.isArray(data.leaves)
            ? data.leaves
            : [];

        const holidays = Array.isArray(data.holidays)
            ? data.holidays
            : [];

        const swaps = Array.isArray(data.swaps)
            ? data.swaps
            : [];

        const policies = Array.isArray(data.policies)
            ? data.policies
            : [];

        if (
            text.includes("employee") &&
            (text.includes("how many") ||
                text.includes("count") ||
                text.includes("total"))
        ) {
            const activeEmployees = employees.filter(
                (employee) =>
                    String(employee.status || "").toUpperCase() ===
                    "ACTIVE"
            ).length;

            return `There are ${employees.length} employees in the system, including ${activeEmployees} active employees.`;
        }

        if (
            text.includes("active employee") ||
            text.includes("active employees")
        ) {
            const activeEmployees = employees.filter(
                (employee) =>
                    String(employee.status || "").toUpperCase() ===
                    "ACTIVE"
            ).length;

            return `There are currently ${activeEmployees} active employees.`;
        }

        if (
            text.includes("pending") &&
            text.includes("leave")
        ) {
            const pending = leaves.filter(
                (leave) => getStatus(leave) === "PENDING"
            ).length;

            return `There are currently ${pending} pending leave requests.`;
        }

        if (
            text.includes("approved") &&
            text.includes("leave")
        ) {
            const approved = leaves.filter(
                (leave) => getStatus(leave) === "APPROVED"
            ).length;

            return `There are currently ${approved} approved leave requests.`;
        }

        if (
            text.includes("rejected") &&
            text.includes("leave")
        ) {
            const rejected = leaves.filter(
                (leave) => getStatus(leave) === "REJECTED"
            ).length;

            return `There are currently ${rejected} rejected leave requests.`;
        }

        if (
            text.includes("leave") &&
            (text.includes("how many") ||
                text.includes("count") ||
                text.includes("total"))
        ) {
            return `There are ${leaves.length} leave requests in the system.`;
        }

        if (
            text.includes("roster") &&
            (text.includes("how many") ||
                text.includes("count") ||
                text.includes("total"))
        ) {
            const assigned = rosters.filter(
                (roster) =>
                    String(roster.status || "").toUpperCase() ===
                    "ASSIGNED"
            ).length;

            return `There are ${rosters.length} roster records, including ${assigned} assigned rosters.`;
        }

        if (
            text.includes("holiday") ||
            text.includes("holidays")
        ) {
            if (holidays.length === 0) {
                return "There are currently no holidays in the system.";
            }

            const names = holidays
                .map(
                    (holiday) =>
                        holiday.holidayName ||
                        holiday.name ||
                        "Holiday"
                )
                .join(", ");

            return `There are ${holidays.length} holidays. They include: ${names}.`;
        }

        if (
            text.includes("shift swap") ||
            text.includes("swap request")
        ) {
            const pending = swaps.filter(
                (swap) => getStatus(swap) === "PENDING"
            ).length;

            const approved = swaps.filter(
                (swap) => getStatus(swap) === "APPROVED"
            ).length;

            return `There are ${swaps.length} shift swap requests: ${pending} pending and ${approved} approved.`;
        }

        if (
            text.includes("policy") ||
            text.includes("policies")
        ) {
            if (policies.length === 0) {
                return "There are currently no policies configured.";
            }

            const names = policies
                .map((policy) => policy.policyName)
                .join(", ");

            return `There are ${policies.length} policies configured: ${names}.`;
        }

        if (text.includes("hello") || text.includes("hi")) {
            return "Hello! I can help you understand your workforce data. Try asking about employees, leaves, rosters, holidays, shift swaps, or policies.";
        }

        return "I can answer questions about employees, leaves, rosters, holidays, shift swaps, and policies. Try asking something like: \"How many active employees do we have?\"";
    };

    const handleAsk = (e) => {
        e.preventDefault();

        if (!question.trim() || loading) {
            return;
        }

        const userQuestion = question.trim();
        const answer = generateAnswer(userQuestion);

        setMessages((previous) => [
            ...previous,
            {
                type: "user",
                text: userQuestion,
            },
            {
                type: "ai",
                text: answer,
            },
        ]);

        setQuestion("");
    };

    const askSuggestedQuestion = (text) => {
        const answer = generateAnswer(text);

        setMessages((previous) => [
            ...previous,
            {
                type: "user",
                text,
            },
            {
                type: "ai",
                text: answer,
            },
        ]);
    };

    return (
        <div
            style={{
                padding: "30px",
                maxWidth: "1000px",
                margin: "0 auto",
            }}
        >
            <h1>🤖 Workforce AI Assistant</h1>

            <p>
                Ask questions about your workforce data.
            </p>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginBottom: "20px",
                }}
            >
                <button
                    onClick={() =>
                        askSuggestedQuestion(
                            "How many active employees do we have?"
                        )
                    }
                >
                    Employee Count
                </button>

                <button
                    onClick={() =>
                        askSuggestedQuestion(
                            "How many pending leaves?"
                        )
                    }
                >
                    Pending Leaves
                </button>

                <button
                    onClick={() =>
                        askSuggestedQuestion(
                            "How many roster assignments?"
                        )
                    }
                >
                    Roster Summary
                </button>

                <button
                    onClick={() =>
                        askSuggestedQuestion(
                            "How many holidays?"
                        )
                    }
                >
                    Holidays
                </button>

                <button
                    onClick={() =>
                        askSuggestedQuestion(
                            "How many shift swap requests?"
                        )
                    }
                >
                    Shift Swaps
                </button>

                <button
                    onClick={() =>
                        askSuggestedQuestion(
                            "What policies are configured?"
                        )
                    }
                >
                    Policies
                </button>
            </div>

            <div
                style={{
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    padding: "20px",
                    minHeight: "350px",
                    marginBottom: "20px",
                }}
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        style={{
                            marginBottom: "15px",
                            textAlign:
                                message.type === "user"
                                    ? "right"
                                    : "left",
                        }}
                    >
                        <div
                            style={{
                                display: "inline-block",
                                maxWidth: "80%",
                                padding: "12px 16px",
                                borderRadius: "10px",
                                background:
                                    message.type === "user"
                                        ? "#e8f0fe"
                                        : "#f1f1f1",
                            }}
                        >
                            <strong>
                                {message.type === "user"
                                    ? "You"
                                    : "AI"}
                                :
                            </strong>{" "}
                            {message.text}
                        </div>
                    </div>
                ))}
            </div>

            <form
                onSubmit={handleAsk}
                style={{
                    display: "flex",
                    gap: "10px",
                }}
            >
                <input
                    type="text"
                    value={question}
                    onChange={(e) =>
                        setQuestion(e.target.value)
                    }
                    placeholder="Ask about your workforce..."
                    style={{
                        flex: 1,
                        padding: "12px",
                        border: "1px solid #ccc",
                        borderRadius: "6px",
                    }}
                />

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: "12px 20px",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}
                >
                    Send
                </button>
            </form>

            {loading && (
                <p style={{ marginTop: "15px" }}>
                    Loading workforce data...
                </p>
            )}
        </div>
    );
}

export default AIAssistant;