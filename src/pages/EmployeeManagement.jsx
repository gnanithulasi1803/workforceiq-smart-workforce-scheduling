
import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:8080/api/employees";

const emptyForm = {
  employeeCode: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  joiningDate: "",
  status: "ACTIVE",
  nightShiftAllowed: true,
};

function EmployeeManagement() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  const getToken = () => localStorage.getItem("token");

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load employees");
      }

      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
: API_URL;

const method = editingId ? "PUT" : "POST";

const response = await fetch(url, {
    method,
    headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
    },
    body: JSON.stringify({
        ...form,
        joiningDate: form.joiningDate || null,
    }),
});

if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to save employee");
}

        if (editingId) {
            setMessage("Employee updated successfully.");
        } else {
            setMessage("Employee created successfully.");
        }

        setForm(emptyForm);
        setEditingId(null);

        await loadEmployees();
} catch (err) {
    setError(err.message);
}
};

const handleEdit = (employee) => {
    setEditingId(employee.id);

    setForm({
        employeeCode: employee.employeeCode || "",
        name: employee.name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        department: employee.department || "",
        designation: employee.designation || "",
        joiningDate: employee.joiningDate || "",
        status: employee.status || "ACTIVE",
        nightShiftAllowed:
            employee.nightShiftAllowed !== false,
    });

    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const handleDelete = async (id) => {
    const confirmed = window.confirm(
        "Are you sure you want to delete this employee?"
    );

    if (!confirmed) {
        return;
    }

    setMessage("");
    setError("");

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "Failed to delete employee");
        }

        setMessage("Employee deleted successfully.");

        if (editingId === id) {
            resetForm();
        }

        await loadEmployees();
    } catch (err) {
        setError(err.message);
    }
};

return (
    <div
        style={{
            padding: "30px",
            maxWidth: "1400px",
            margin: "0 auto",
            fontFamily: "Arial, sans-serif",
        }}
    >
        <h1 style={{ marginBottom: "8px" }}>
            Employee Management
        </h1>

        <p style={{ color: "#666", marginBottom: "25px" }}>
            Create, update, view and delete workforce employees.
        </p>

        {message && (
            <div
                style={{
                    background: "#e8f5e9",
                    color: "#2e7d32",
                    padding: "12px 16px",
                    borderRadius: "6px",
                    marginBottom: "15px",
                }}
            >
                {message}
            </div>
        )}

        {error && (
            <div
                style={{
                    background: "#ffebee",
                    color: "#c62828",
                    padding: "12px 16px",
                    borderRadius: "6px",
                    marginBottom: "15px",
                    whiteSpace: "pre-wrap",
                }}
            >
                {error}
            </div>
        )}

        {/* Employee Form */}
        <div
            style={{
                background: "#ffffff",
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "25px",
                marginBottom: "30px",
            }}
        >
            <h2 style={{ marginTop: 0 }}>
                {editingId ? "Edit Employee" : "Add Employee"}
            </h2>

            <form onSubmit={handleSubmit}>
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                        gap: "18px",
                    }}
                >
                    <div>
                        <label>Employee Code</label>
                        <input
                            type="text"
                            name="employeeCode"
                            value={form.employeeCode}
                            onChange={handleChange}
                            required
                            disabled={!!editingId}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label>Phone</label>
                        <input
                            type="text"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label>Department</label>
                        <input
                            type="text"
                            name="department"
                            value={form.department}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label>Designation</label>
                        <input
                            type="text"
                            name="designation"
                            value={form.designation}
                            onChange={handleChange}
                            style={inputStyle}
                        />
                    </div>

                    <div>
                        <label>Joining Date</label>
                        <input
                            type="date"
                            name="joiningDate"
                            value={form.joiningDate}
                            onChange={handleChange}
                            style={inputStyle}
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

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            paddingTop: "25px",
                        }}
                    >
                        <input
                            type="checkbox"
                            name="nightShiftAllowed"
                            checked={form.nightShiftAllowed}
                            onChange={handleChange}
                        />

                        <label>Night Shift Allowed</label>
                    </div>
                </div>

                <div
                    style={{
                        marginTop: "22px",
                        display: "flex",
                        gap: "10px",
                    }}
                >
                    <button type="submit" style={primaryButton}>
                        {editingId ? "Update Employee" : "Add Employee"}
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

        {/* Employee List */}
        <div
            style={{
                background: "#ffffff",
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "25px",
                overflowX: "auto",
            }}
        >
            <h2 style={{ marginTop: 0 }}>
                Employee List ({employees.length})
            </h2>

            {loading ? (
                <p>Loading employees...</p>
            ) : employees.length === 0 ? (
                <p>No employees found.</p>
            ) : (
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        minWidth: "1100px",
                    }}
                >
                    <thead>
                    <tr>
                        <th style={thStyle}>ID</th>
                        <th style={thStyle}>Code</th>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Email</th>
                        <th style={thStyle}>Phone</th>
                        <th style={thStyle}>Department</th>
                        <th style={thStyle}>Designation</th>
                        <th style={thStyle}>Joining Date</th>
                        <th style={thStyle}>Status</th>
                        <th style={thStyle}>Night Shift</th>
                        <th style={thStyle}>Actions</th>
                    </tr>
                    </thead>

                    <tbody>
                    {employees.map((employee) => (
                        <tr key={employee.id}>
                            <td style={tdStyle}>{employee.id}</td>
                            <td style={tdStyle}>
                                {employee.employeeCode}
                            </td>
                            <td style={tdStyle}>{employee.name}</td>
                            <td style={tdStyle}>{employee.email}</td>
                            <td style={tdStyle}>
                                {employee.phone || "-"}
                            </td>
                            <td style={tdStyle}>
                                {employee.department || "-"}
                            </td>
                            <td style={tdStyle}>
                                {employee.designation || "-"}
                            </td>
                            <td style={tdStyle}>
                                {employee.joiningDate || "-"}
                            </td>
                            <td style={tdStyle}>
                    <span
                        style={{
                            padding: "4px 8px",
                            borderRadius: "12px",
                            background:
                                employee.status === "ACTIVE"
                                    ? "#e8f5e9"
                                    : "#eeeeee",
                            color:
                                employee.status === "ACTIVE"
                                    ? "#2e7d32"
                                    : "#555",
                            fontSize: "12px",
                            fontWeight: "bold",
                        }}
                    >
                      {employee.status || "-"}
                    </span>
                            </td>
                            <td style={tdStyle}>
                                {employee.nightShiftAllowed
                                    ? "Yes"
                                    : "No"}
                            </td>
                            <td style={tdStyle}>
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "8px",
                                    }}
                                >
                                    <button
                                        onClick={() => handleEdit(employee)}
                                        style={editButton}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(employee.id)
                                        }
                                        style={deleteButton}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    </div>
);
}

const inputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px 12px",
    marginTop: "6px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
};

const primaryButton = {
    padding: "10px 18px",
    border: "none",
    borderRadius: "6px",
    background: "#1976d2",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "bold",
};

const secondaryButton = {
    padding: "10px 18px",
    border: "1px solid #aaa",
    borderRadius: "6px",
    background: "#fff",
    cursor: "pointer",
};

const editButton = {
    padding: "6px 12px",
    border: "none",
    borderRadius: "5px",
    background: "#1976d2",
    color: "#fff",
    cursor: "pointer",
};

const deleteButton = {
    padding: "6px 12px",
    border: "none",
    borderRadius: "5px",
    background: "#d32f2f",
    color: "#fff",
    cursor: "pointer",
};

const thStyle = {
    textAlign: "left",
    padding: "12px 10px",
    borderBottom: "2px solid #ddd",
    background: "#f5f5f5",
    fontSize: "13px",
};

const tdStyle = {
    padding: "12px 10px",
    borderBottom: "1px solid #eee",
    fontSize: "13px",
};

export default EmployeeManagement;
