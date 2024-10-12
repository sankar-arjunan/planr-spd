import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EditPopup, PrimaryButton, SecondaryButton, svgIconStyle } from "./Utility";
import { toast } from 'react-toastify';
import { useCookies } from 'react-cookie';

function TaskPut() {
    const location = useLocation();
    const navigate = useNavigate();
    const [menu, setMenu] = useState(location.pathname);
    const queryParams = new URLSearchParams(location.search);
    const [taskid, setTaskid] = useState(queryParams.get('update'));
    const [cookies] = useCookies(['jwt']);
    const [formData, setFormData] = useState({
        taskName: '',
        time: '',
        category: '',
        hasFlexibleTime: false, // New field for flexible time
    });

    useEffect(() => {
        const newTaskId = queryParams.get('update');
        setTaskid(newTaskId);

        if (newTaskId && newTaskId !== 'newtask') {
            const fetchTaskDetails = async () => {
                try {
                    const response = await fetch(`http://localhost:5000/task/id/${newTaskId}`, {
                        headers: {
                            'Authorization': `Bearer ${cookies.jwt}`
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setFormData({
                            taskName: data.taskName,
                            time: new Date(data.time).toISOString().slice(0, 16),
                            category: data.category,
                            hasFlexibleTime: data.hasFlexibleTime || false, // Set existing value
                        });
                    } else {
                        toast.error("Failed to fetch task details.");
                    }
                } catch (error) {
                    toast.error("An unexpected error occurred.");
                }
            };

            fetchTaskDetails();
        }
    }, [location.search, cookies.jwt]);

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = taskid === 'newtask'
                ? await fetch('http://localhost:5000/task/', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${cookies.jwt}`,
                    },
                    body: JSON.stringify(formData),
                })
                : await fetch(`http://localhost:5000/task/id/${taskid}`, {
                    method: 'PUT',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${cookies.jwt}`,
                    },
                    body: JSON.stringify(formData),
                });

            const data = await response.json();
            if (response.ok) {
                toast.success(taskid === 'newtask' ? "Task created successfully!" : "Task updated successfully!");
                window.location.reload();
            } else {
                toast.error(data.message || "Error processing the request.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        }
    };

    const handleDelete = async () => {
        try {
            const response = await fetch(`http://localhost:5000/task/id/${taskid}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${cookies.jwt}`,
                },
            });

            if (response.ok) {
                toast.success("Task deleted successfully!");
                navigate(menu);
                window.location.reload();
            } else {
                const data = await response.json();
                toast.error(data.message || "Error deleting the task.");
            }
        } catch (error) {
            toast.error("An unexpected error occurred.");
        }
    };

    return (
        <EditPopup>
            <h2>{taskid === "newtask" ? "Add" : "Edit"} Task Details</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <div style={styles.formGroup}>
                    <label htmlFor="taskName" style={styles.label}>Task Name:</label>
                    <input
                        type="text"
                        id="taskName"
                        name="taskName"
                        value={formData.taskName}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="time" style={styles.label}>Deadline Time:</label>
                    <input
                        type="datetime-local"
                        id="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>
                <div style={styles.formGroup}>
                    <label htmlFor="category" style={styles.label}>Category:</label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        style={styles.input}
                    />
                </div>
                <div style={{ ...styles.formGroup, flexDirection: "row"}}>
                    <label htmlFor="hasFlexibleTime" style={styles.label}>Does the time flexible? :</label>
                    <input
                        type="checkbox"
                        id="hasFlexibleTime"
                        name="hasFlexibleTime"
                        checked={formData.hasFlexibleTime}
                        onChange={handleChange}
                        style={{...styles.checkbox, marginTop:"0px"}}
                    />
                </div>
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: "4px" }}>
                    {taskid !== "newtask" && (
                        <SecondaryButton onClick={handleDelete} type="button" style={{ ...styles.button, background: "rgb(253 202 202)", color: "red", borderColor: "red" }}>
                            Delete
                        </SecondaryButton>
                    )}
                    <SecondaryButton onClick={() => navigate(menu)} style={styles.button}>Cancel</SecondaryButton>
                    <PrimaryButton style={styles.button} onClick={handleSubmit}>Submit</PrimaryButton>
                </div>
            </form>
        </EditPopup>
    );
}

const styles = {
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        padding: '20px',
        maxWidth: '500px'
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
    },
    label: {
        fontSize: '16px',
        fontWeight: 'bold',
        textAlign: "left"
    },
    input: {
        padding: '10px',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '16px',
    },
    checkbox: {
        marginTop: '5px',
    },
    button: {
        alignSelf: 'flex-start',
    },
};

export default TaskPut;
