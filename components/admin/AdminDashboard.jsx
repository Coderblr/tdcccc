import {
    Users,
    Activity,
    Shield,
    Lock,
    Unlock,
    TrendingUp,
    AlertCircle
} from "lucide-react";
import { styles } from "../../styles/AppStyles";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("userToken");
            const res = await fetch("http://localhost:5050/admin/dashboard/stats", {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch admin stats", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: "2rem" }}>Loading admin stats...</div>;

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>Admin Dashboard</h1>
                <p style={styles.subtitle}>Platform Overview & Statistics</p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "1.5rem",
                marginTop: "1.5rem"
            }}>
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon={<Users size={24} color="#1565C0" />}
                    color="#e3f2fd"
                />
                <StatCard
                    title="Active Users"
                    value={stats?.activeUsers || 0}
                    icon={<TrendingUp size={24} color="#2e7d32" />}
                    color="#e8f5e9"
                />
                <StatCard
                    title="Locked Accounts"
                    value={stats?.lockedUsers || 0}
                    icon={<Lock size={24} color="#c62828" />}
                    color="#ffebee"
                />
                <StatCard
                    title="Total Activities"
                    value={stats?.totalActivities || 0}
                    icon={<Activity size={24} color="#f9a825" />}
                    color="#fffde7"
                />
            </div>

            <div style={{ marginTop: "2rem" }}>
                <h3 style={styles.sectionTitle}>Quick Actions</h3>
                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button style={styles.primaryBtn}>Manage Users</button>
                    <button style={styles.secondaryBtn}>View Activity Logs</button>
                    <button style={styles.secondaryBtn}>System Settings</button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, color }) {
    return (
        <div style={{
            backgroundColor: "white",
            padding: "1.5rem",
            borderRadius: "12px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            gap: "1rem"
        }}>
            <div style={{
                backgroundColor: color,
                padding: "12px",
                borderRadius: "50%"
            }}>
                {icon}
            </div>
            <div>
                <p style={{ margin: 0, color: "#666", fontSize: "0.9rem" }}>{title}</p>
                <h2 style={{ margin: 0, fontSize: "1.8rem", color: "#333" }}>{value}</h2>
            </div>
        </div>
    );
}
