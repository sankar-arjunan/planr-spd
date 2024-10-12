import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PrimaryButton, svgIconStyle, TaskGroup, TaskItem } from "./Utility";
import styled from "styled-components";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import Suggested from "./Suggested";

// Styled components
const LoadingMessage = styled.p`
  text-align: center;
  font-size: 1.2em;
`;

const NoTasksMessage = styled.p`
  text-align: center;
  font-size: 1.2em;
  color: #888;
`;

const TaskContainer = styled(TaskItem)`
  display: flex;
  flex-direction: row;
  background: ${(props) => (props.completionType === "completed" ? "rgb(204, 204, 204)" : "rgb(247, 247, 247)")};
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
`;

const TaskHeader = styled.h2`
  margin: 0;
  font-size: 1.5em;
`;

const TaskDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CompletionInfo = styled.p`
  color: ${(props) => props.color};
  display: flex;
  align-items: center;
  text-transform: uppercase;
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  position: relative; // Added for absolute positioning of tooltips
`;

const EditButton = styled(PrimaryButton)`
  height: 20px;
  background: transparent;
  color: black;

  &:hover {
    background: rgb(249, 206, 137);
    color: black;
  }
`;

const CompleteButton = styled(PrimaryButton)`
  height: 20px;
  color: white;
  background: ${(props) => props.color};
`;

const Tooltip = styled.div`
  position: absolute;
  bottom: 125%; // Position above the button
  left: 50%;
  transform: translateX(-50%);
  background-color: black;
  color: white;
  padding: 5px;
  border-radius: 4px;
  visibility: hidden;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 1;

  ${CompleteButton}:hover & {
    visibility: visible;
    opacity: 1;
  }

  ${EditButton}:hover & {
    visibility: visible;
    opacity: 1;
  }
`;

function Task() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [cookies] = useCookies(['jwt']);
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const arr = ["", "live", "completed", "timeup"];
  const [reload, setReload] = useState(false);

  const queryParams = new URLSearchParams(location.search);
  const queryString = queryParams.get('query') ? `?search=${queryParams.get('query')}` : "";

  const setAsCompleted = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/task/completed/${id}`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${cookies.jwt}` }
      });
      if (response.ok) {
        setTasks(tasks => tasks.map(task => task.taskId === id ? { ...task, completionType: 'completed' } : task));
        setReload(true);
      } else {
        toast('Failed to mark as completed', response.statusText);
      }
    } catch (error) {
      toast('Error marking as completed', error);
    }
  };

  const setAsLive = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/task/live/${id}`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${cookies.jwt}` }
      });
      if (response.ok) {
        setTasks(tasks => tasks.map(task => task.taskId === id ? { ...task, completionType: 'live' } : task));
        setReload(true);
      } else {
        const errorData = await response.json();
        toast.error(`Failed to mark as live: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      toast('Error marking as live', error);
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const url = arr.includes(location.pathname.slice(1).toLowerCase())
          ? `http://localhost:5000/task/${location.pathname.slice(1).toLowerCase() || 'today'}${queryString}`
          : `http://localhost:5000/task/category/${location.pathname.slice(1).toLowerCase()}${queryString}`;

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${cookies.jwt}` }
        });

        if (response.ok) {
          const data = await response.json();
          setTasks(data);
          setReload(false);
        } else {
          console.error('Failed to fetch tasks:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [cookies.jwt, location.pathname, queryString, reload]);

  const getStyle = (type) => {
    switch (type) {
      case "live":
        return {
          background: 'transparent',
          color: 'green',
          border: '1px solid green',
        };
      case "completed":
        return {
          background: 'green',
          color: 'white',
          border: '1px solid green',
        };
      case "timeup":
        return {
          background: 'transparent',
          color: 'red',
          border: '1px solid red',
        };
      default:
        return {
          background: 'transparent',
          color: 'black',
          border: '1px solid transparent',
        };
    }
  };

  const formatDate = (date) => {
    return `${new Date(date).getDate()} ${new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(date)).toUpperCase()} - ${new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  };

  return (
    <TaskGroup>
      {location.pathname.slice(1).toLowerCase() === "" && <Suggested />}
      {loading ? (
        <LoadingMessage>Loading...</LoadingMessage>
      ) : tasks.length > 0 ? (
        tasks.map((task) => (
          <TaskContainer key={task.taskId} completionType={task.completionType}>
            <TaskDetails>
              <TaskHeader>{task.taskName}</TaskHeader>
              <CompletionInfo>
                <span style={{ color: '#5189b9', fontWeight: '600' }}>{task.category}</span>
                <span style={{ margin: '0 8px', color: "#7b7b7b" }}>•</span>
                <span style={{ color: '#7b7b7b', fontWeight: '600' }}>{formatDate(task.time)}</span>
              </CompletionInfo>
            </TaskDetails>
            <ActionButtons>
              {task.completionType !== 'completed' && (
                <EditButton 
                onClick={() => {
                    navigate(`?update=${task.taskId}`);
                    window.location.reload();
                }}
            >
                  <svg style={{ ...svgIconStyle, fill: "black", height: "20px", width: "20px" }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M14.06,9L15,9.94L5.92,19H5V18.08L14.06,9M17.66,3C17.41,3 17.15,3.1 16.96,3.29L15.13,5.12L18.88,8.87L20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18.17,3.09 17.92,3 17.66,3M14.06,6.19L3,17.25V21H6.75L17.81,9.94L14.06,6.19Z" />
                  </svg>
                  <Tooltip>Edit task</Tooltip>
                </EditButton>
              )}
              <CompleteButton
                style={getStyle(task.completionType)}
                onClick={() => {
                  if (task.completionType === "live") {
                    setAsCompleted(task.taskId);
                  } else if (task.completionType === "completed") {
                    setAsLive(task.taskId);
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  style={{ height: '20px', width: '20px', fill: task.completionType === "completed" ? "white" : "green", marginRight: '4px' }}
                >
                  <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                </svg>
                <Tooltip>{task.completionType === "live" ? "Mark as completed" : "Mark uncomplete"}</Tooltip>
              </CompleteButton>
            </ActionButtons>
          </TaskContainer>
        ))
      ) : (
        <NoTasksMessage>No tasks available.</NoTasksMessage>
      )}
    </TaskGroup>
  );
}

export default Task;
