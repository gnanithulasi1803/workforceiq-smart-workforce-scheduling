import React, { useEffect, useState } from "react";

function Profile() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));

            setUser(payload);
        } catch (error) {
            console.error("Unable to read user information", error);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");

        window.location.href = "/";
    };

    if (!user) {
        return (
            <div
                style={{
                    padding: "30px",
                    maxWidth: "900px",
                    margin: "0 auto",
                }}
            >
                <h1>Profile</h1>
                <p>Unable to load profile information.</p>
            </div>
        );
    }

    const username =
        user.sub ||
        user.username ||
        user.email ||
        "User";

    const role =
        user.role ||
        user.authorities?.[0]?.authority ||
        "USER";

    const email =
        user.email ||
        "Not available";

    return (
        <div
            style={{
                padding: "30px",
                maxWidth: "900px",
                margin: "0 auto",
            }}
        >
            <div style={{ marginBottom: "25px" }}>
                <h1>My Profile</h1>

                <p style={{ color: "#666" }}>
                    View your account information and manage your session.
                </p>
            </div>

            <div
                style={{
                    background: "#fff",
                    padding: "30px",
                    borderRadius: "10px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
            >
                <div
                    style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "50%",
                        background: "#2563eb",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "30px",
                        fontWeight: "bold",
                        marginBottom: "20px",
                    }}
                >
                    {username.charAt(0).toUpperCase()}
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={labelStyle}>
                        Username
                    </label>

                    <div style={valueStyle}>
                        {username}
                    </div>
                </div>

                <div style={{ marginBottom: "20px" }}>
                    <label style={labelStyle}>
                        Email
                    </label>

                    <div style={valueStyle}>
                        {email}
                    </div>
                </div>

                <div style={{ marginBottom: "25px" }}>
                    <label style={labelStyle}>
                        Role
                    </label>

                    <div style={valueStyle}>
                        {role}
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    style={logoutButton}
                >
                    Logout
                </button>
            </div>
        </div>
    );
}

const labelStyle = {
    display: "block",
    fontSize: "14px",
    color: "#666",
    marginBottom: "6px",
    fontWeight: "600",
};

const valueStyle = {
    padding: "12px",
    background: "#f8fafc",
    borderRadius: "6px",
    border: "1px solid #e2e8f0",
};

const logoutButton = {
    padding: "11px 24px",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
};

export default Profile;