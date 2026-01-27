import { useState, useEffect } from "react";
import { styles } from "../../styles/AppStyles";
import { FileText, Download, Filter } from "lucide-react";

export default function ActivityLogs() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const token = localStorage.getItem("userToken");
            const res = await fetch("http://localhost:5050/admin/activities", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        const headers = ["ID", "User", "Action", "Timestamp", "Status", "Details"];
        const csvContent = [
            headers.join(","),
            ...logs.map(log => [
                log.id,
                log.username,
                log.action,
                log.timestamp,
                log.status,
                // Escape quotes in details JSON for CSV
                `"${JSON.stringify(log.details).replace(/"/g, '""')}"`
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const filteredLogs = logs.filter(log =>
        log.username.toLowerCase().includes(filter.toLowerCase()) ||
        log.action.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div style={{ flex: 1 }}>
                    <h1 style={styles.title}>Activity Logs</h1>
                    <p style={styles.subtitle}>Audit trail of system usage</p>
                </div>
                <button onClick={handleExport} style={styles.primaryBtn}>
                    <Download size={18} style={{ marginRight: "8px" }} />
                    Export CSV
                </button>
            </div>

            <div style={{ marginBottom: "1.5rem", position: "relative" }}>
                <input
                    type="text"
                    placeholder="Filter by user or action..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    style={{
                        width: "100%",
                        padding: "10px 10px 10px 40px",
                        borderRadius: "8px",
                        border: "1px solid #ddd"
                    }}
                />
                <Filter size={18} style={{ position: "absolute", left: "12px", top: "12px", color: "#888" }} />
            </div>

            <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #eee", backgroundColor: "#f9f9f9" }}>
                            <th style={thStyle}>Time</th>
                            <th style={thStyle}>User</th>
                            <th style={thStyle}>Action</th>
                            <th style={thStyle}>Details</th>
                            <th style={thStyle}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id} style={{ borderBottom: "1px solid #eee" }}>
                                <td style={tdStyle}>{new Date(log.timestamp).toLocaleString()}</td>
                                <td style={{ ...tdStyle, fontWeight: "600", color: "#1565C0" }}>{log.username}</td>
                                <td style={tdStyle}>
                                    <span style={{
                                        backgroundColor: "#f5f5f5",
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        fontFamily: "monospace"
                                    }}>
                                        {log.action}
                                    </span>
                                </td>
                                <td style={{ ...tdStyle, maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    <span title={JSON.stringify(log.details, null, 2)} style={{ color: "#666" }}>
                                        {JSON.stringify(log.details)}
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    <span style={{
                                        color: log.status === "success" ? "green" : "red",
                                        fontWeight: "600"
                                    }}>
                                        {log.status.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredLogs.length === 0 && (
                    <div style={{ padding: "2rem", textAlign: "center", color: "#888" }}>
                        No activities found matching your filter.
                    </div>
                )}
            </div>
        </div>
    );
}

const thStyle = { padding: "12px 16px", textAlign: "left", color: "#555", fontWeight: "600" };
const tdStyle = { padding: "12px 16px" };
