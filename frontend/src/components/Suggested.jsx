import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PrimaryButton, TaskItem } from "./Utility";
import styled from "styled-components";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";

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
`;

const CompleteButton = styled(PrimaryButton)`
  height: 20px;
  color: black;
  background: white;
  border: 1px solid transparent;
  position: relative;
  
  &:hover {
    cursor: pointer;
  }
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
`;

function Suggested() {
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [cookies] = useCookies(['jwt']);
  
  useEffect(() => {
    const fetchSuggestedTask = async () => {
      try {
        const response = await fetch('http://localhost:5000/task/suggested', {
          headers: {
            'Authorization': `Bearer ${cookies.jwt}`,
          }
        });

        if (response.ok) {
          const data = await response.json();
          setTask(data);
        } else {
          toast.error("Failed to fetch suggested task.");
        }
      } catch (error) {
        toast.error("An unexpected error occurred.");
      }
    };

    fetchSuggestedTask();
  }, [cookies.jwt]);

  const handleComplete = async () => {
    if (task) {
      try {
        const response = await fetch(`http://localhost:5000/task/suggested-completed`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cookies.jwt}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ taskId: task.taskId })
        });

        if (response.ok) {
          toast.success("Task marked as completed!");
          setTask(null);
        } else {
          toast.error("Error marking task as completed.");
        }
      } catch (error) {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const handleBadSuggestion = async () => {
    if (task) {
      try {
        const response = await fetch(`http://localhost:5000/task/suggested-bad`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cookies.jwt}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ taskId: task.taskId })
        });

        if (response.ok) {
          toast.success("Task suggestion marked as bad!");
          setTask(null);
        } else {
          toast.error("Error marking task suggestion as bad.");
        }
      } catch (error) {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  const formatDate = (date) => {
    return `${new Date(date).getDate()} ${new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(date)).toUpperCase()} - ${new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  };

  return (
    <>
      {task ? (
        <TaskContainer completionType={task.completionType}>
          <TaskDetails>
            <TaskHeader>{task.taskName}</TaskHeader>
            <CompletionInfo>
              <span style={{ color: '#5189b9', fontWeight: '600' }}>{task.category}</span>
              <span style={{ margin: '0 8px', color: "#7b7b7b" }}>•</span>
              <span style={{ color: '#7b7b7b', fontWeight: '400', fontStyle: 'italic' }}>Flexible Timing</span>
            </CompletionInfo>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "12px" }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ height: '20px', width: '20px', fill: '#b16d00', marginRight: '4px' }}>
                <path d="M7.5,5.6L5,7L6.4,4.5L5,2L7.5,3.4L10,2L8.6,4.5L10,7L7.5,5.6M19.5,15.4L22,14L20.6,16.5L22,19L19.5,17.6L17,19L18.4,16.5L17,14L19.5,15.4M22,2L20.6,4.5L22,7L19.5,5.6L17,7L18.4,4.5L17,2L19.5,3.4L22,2M13.34,12.78L15.78,10.34L13.66,8.22L11.22,10.66L13.34,12.78M14.37,7.29L16.71,9.63C17.1,10 17.1,10.65 16.71,11.04L5.04,22.71C4.65,23.1 4,23.1 3.63,22.71L1.29,20.37C0.9,20 0.9,19.35 1.29,18.96L12.96,7.29C13.35,6.9 14,6.9 14.37,7.29Z" />
              </svg>
              <p style={{ color: "#b16d00" }}>Suggested</p>
            </div>
          </TaskDetails>
          <ActionButtons>
            <CompleteButton 
              style={{ background: 'white', borderColor: 'red' }} 
              onClick={handleBadSuggestion}
            >
              <Tooltip>Bad suggestion</Tooltip>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ height: '20px', width: '20px', fill: 'red', marginRight: '4px' }}>
                <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
              </svg>
            </CompleteButton>
            <CompleteButton 
              style={{ background: 'white', borderColor: 'green' }} 
              onClick={handleComplete}
            >
              <Tooltip>Mark as Completed</Tooltip>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ height: '20px', width: '20px', fill: 'green', marginRight: '4px' }}>
                <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
              </svg>
            </CompleteButton>
          </ActionButtons>
        </TaskContainer>
      ) : (
        <NoTasksMessage>No suggested tasks available.</NoTasksMessage>
      )}
    </>
  );
}

export default Suggested;
