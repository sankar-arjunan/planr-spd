import { useLocation } from "react-router-dom";
import Task from "./Task";
import { PrimaryButton, svgIconStyle, BodyContainer, TaskGroup, TaskItem } from "./Utility";
import { useState, useEffect } from "react";
import Suggested from "./Suggested";

function TaskColumn() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const layout = queryParams.get('layout');
  const [query,setQuery] = useState(queryParams.get('query'));


    return (
    <TaskGroup style={{flex: '0 0 55%'}}>
          <h2 style={{textAlign:"left", marginLeft:"24px",textTransform: "capitalize"}}>{layout!="search"?`${location.pathname.slice(1)===""?"Today's":location.pathname.slice(1)==="Live"?"Upcoming":location.pathname.slice(1)} Tasks`:`Search results for "${query}"`}</h2>
          <Task/>
    </TaskGroup>
  );
}



export default TaskColumn;
