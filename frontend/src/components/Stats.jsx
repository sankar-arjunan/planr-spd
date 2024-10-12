import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { TaskGroup, TaskItem } from "./Utility";

function Stats() {
    const [cookies] = useCookies(['jwt']);
    const [stats, setStats] = useState({
        completionRate: 0,
        productivityChange: 0, // Ensure default is a number
        productiveTime: 'N/A',
        productiveDay: 'N/A',
        productiveCategory: 'N/A',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("http://localhost:5000/task/stats", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${cookies.jwt}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("Failed to fetch stats");
                }

                const data = await response.json();
                // Ensure the data is in the expected format
                setStats({
                    completionRate: data.completionRate ?? 0,
                    productivityChange: Number(data.productivityChange) || 0, // Ensure this is a number
                    productiveTime: data.productiveTime ?? 'N/A',
                    productiveDay: data.productiveDay ?? 'N/A',
                    productiveCategory: data.productiveCategory ?? 'N/A',
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [cookies.jwt]);

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <TaskGroup>
            <h2>Your Stats</h2>
            <TaskItem>
                <p style={{ color: "#276cab", fontSize: "60px", fontWeight: "800", margin: "8px", textAlign: "center" }}>{stats.completionRate.toFixed(0)}%</p>
                <p style={{ color: "black", fontSize: "20px", fontWeight: "400", textAlign: "center" }}>Task completion rate</p>
            </TaskItem>
            <TaskItem>
                <p style={{ color: "#008b10", fontSize: "60px", fontWeight: "800", margin: "8px", textAlign: "center" }}>{typeof stats.productivityChange === 'number' ? stats.productivityChange.toFixed(0) : 'N/A'}%</p>
                <p style={{ color: "black", fontSize: "20px", fontWeight: "400", textAlign: "center" }}>More productive this week</p>
            </TaskItem>

            <TaskItem style={{ flexDirection: "column", textAlign: "center" }}>
                <h3>Most productive time of day</h3>
                <p style={{ color: "#276cab", fontSize: "56px", fontWeight: "800", margin: "8px" }}>{stats.productiveTime}</p>
            </TaskItem>
            <TaskItem style={{ flexDirection: "column", textAlign: "center" }}>
                <h3>Most productive day of the week</h3>
                <p style={{ color: "#276cab", fontSize: "56px", fontWeight: "800", margin: "8px" }}>{stats.productiveDay}</p>
            </TaskItem>
            <TaskItem style={{ flexDirection: "column", textAlign: "center" }}>
                <h3>Most productive task type</h3>
                <p style={{ color: "#276cab", fontSize: "56px", fontWeight: "800", margin: "8px" }}>{stats.productiveCategory}</p>
            </TaskItem>
        </TaskGroup>
    );
}

export default Stats;
