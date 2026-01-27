import { useState, useEffect } from "react";
import { styles } from "../../styles/AppStyles";
import { Lock, Unlock, Trash2, UserCog, Search } from "lucide-react";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("userToken");
            const res = await fetch("http://localhost:5050/admin/users", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (username, action) => {
        if (!confirm(`Are you sure you want to ${action} user ${username}?`)) return;

        try {
            const token = localStorage.getItem("userToken");
            const method = action === "delete" ? "DELETE" : "POST";
            const url = action === "delete"
                ? `http://localhost:5050/admin/users/${username}`
                : `http://localhost:5050/admin/users/${username}/${action}`; // lock or unlock

            const res = await fetch(url, {
                method: method,
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok) {
                setMessage(`User ${username} ${action}ed successfully`);
                fetchUsers(); // Refresh list
                setTimeout(() => setMessage(""), 3000);
            } else {
                const err = await res.json();
                alert(err.detail);
            }
        } catch (err) {
            console.error(err);
            alert("Action failed");
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(filter.toLowerCase()) ||
        u.firstName.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>User Management</h1>
                <p style={styles.subtitle}>Manage system access and authentication</p>
            </div>

            {message && (
                <div style={{
                    padding: "10px",
                    backgroundColor: "#e8f5e9",
                    color: "green",
                    borderRadius: "4px",
                    marginBottom: "1rem"
                }}>
                    {message}
                </div>
            )}

            <div style={{ marginBottom: "1.5rem", position: "relative" }}>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "10px 10px 10px 40px",
                        borderRadius: "8px",
                        border: "1px solid #ddd"
                    }}
                />
                <Search size={18} style={{ position: "absolute", left: "12px", top: "12px", color: "#888" }} />
            </div>

            <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #eee", backgroundColor: "#f9f9f9" }}>
                            <th style={thStyle}>User</th>
                            <th style={thStyle}>Role</th>
                            <th style={thStyle}>Department</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Last Login</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.username} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={tdStyle}>
                                    <div style={{ fontWeight: "600" }}>{user.firstName} {user.lastName}</div>
                                    <div style={{ fontSize: "0.85rem", color: "#666" }}>@{user.username}</div>
                                </td>
                                <td style={tdStyle}>
                                    <span style={{
                                        padding: "4px 8px",
                                        borderRadius: "12px",
                                        fontSize: "0.8rem",
                                        backgroundColor: user.role === "admin" ? "#e3f2fd" : "#f5f5f5",
                                        color: user.role === "admin" ? "#1565c0" : "#666"
                                    }}>
                                        {user.role.toUpperCase()}
                                    </span>
                                </td>
                                <td style={tdStyle}>{user.departmentCode}</td>
                                <td style={tdStyle}>
                                    {user.isLocked ? (
                                        <span style={{ color: "red", display: "flex", alignItems: "center", gap: "4px" }}>
                                            <Lock size={14} /> Locked
                                        </span>
                                    ) : (
                                        <span style={{ color: "green", display: "flex", alignItems: "center", gap: "4px" }}>
                                            <Unlock size={14} /> Active
                                        </span>
                                    )}
                                </td>
                                <td style={tdStyle}>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}</td>
                                <td style={tdStyle}>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        {user.role !== "admin" && (
                                            <button onClick={() => handleAction(user.username, "promote")} title="Promote to Admin" style={iconBtnStyle}>
                                                <UserCog size={18} color="#1565C0" />
                                            </button>
                                        )}
                                        {user.isLocked ? (
                                            <button onClick={() => handleAction(user.username, "unlock")} title="Unlock" style={iconBtnStyle}>
                                                <Unlock size={18} color="green" />
                                            </button>
                                        ) : (
                                            <button onClick={() => handleAction(user.username, "lock")} title="Lock" style={iconBtnStyle}>
                                                <Lock size={18} color="orange" />
                                            </button>
                                        )}
                                        <button onClick={() => handleAction(user.username, "delete")} title="Delete" style={iconBtnStyle}>
                                            <Trash2 size={18} color="red" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

const thStyle = { padding: "12px 16px", textAlign: "left", fontSize: "0.9rem", color: "#555", fontWeight: "600" };
const tdStyle = { padding: "12px 16px", fontSize: "0.95rem" };
const iconBtnStyle = { background: "none", border: "none", cursor: "pointer", padding: "4px" };
