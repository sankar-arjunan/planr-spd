import { useLocation, useNavigate } from "react-router-dom";
import { PrimaryButton, SidebarContainer, TopCTA, MenuItems, MenuItem, svgIconStyle } from "./Utility";
import { useState, useEffect } from "react";
import { useCookies } from 'react-cookie';
const Sidebar = ({setMenuGlobal}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [menu,setMenu] = useState(location.pathname);
    const [cat, setCat] = useState([]);
    const [cookies] = useCookies(['jwt']); 
    
  
    const navigateToNewPath = (newPath) => {
      const currentSearch = location.search; 
      navigate(`${newPath}${currentSearch}`);
    };
  
    useEffect(() => {
        const fetchCategories = async () => {
          try {
            const response = await fetch('http://localhost:5000/task/categories', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${cookies.jwt}`, // Use the JWT from the cookie
                'Content-Type': 'application/json'
              }
            });
    
            if (!response.ok) {
              throw new Error('Failed to fetch categories');
            }
    
            const data = await response.json();
            const predefinedCategories = ["", "Live", "Completed", "Timeup"];
            setCat([...predefinedCategories, ...data]);
          } catch (error) {
            console.error('Error fetching categories:', error);
          }
        };
    
        if (cookies.jwt) { // Only fetch if JWT exists
          fetchCategories();
        }
      }, [cookies.jwt]);

    const selectedStyle = {
        background: "rgb(35 52 67)",
        color: "#FFFFFF"
    };

    const newTaskclick = () =>{
        navigate("?update=newtask");
    }

    const categoryChange = (category,setMenuGlobal) => {
        navigateToNewPath(`/${category}`);
        setMenu(`/${category}`);
        setMenuGlobal(`${category}`);
        window.location.reload();

    }
    return (
    <div>
    <SidebarContainer>
        <h2 style={{alignSelf:"center"}}>Plan-R</h2>
        <TopCTA>
            <PrimaryButton onClick={newTaskclick} style={{background : "#ffcf89", color : "black"}}>New Task</PrimaryButton>
        </TopCTA>
        <MenuItems>
            {cat.map((cat, index) => (
                <><MenuItem onClick={()=>categoryChange(cat,setMenuGlobal)} style={(`/${cat}` === menu? selectedStyle: {})}><svg style={svgIconStyle} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d={(cat == "Today") ? "M9,13H15V19H18V10L12,5.5L6,10V19H9V13M4,21V9L12,3L20,9V21H4Z" : "M16,17H5V7H16L19.55,12M17.63,5.84C17.27,5.33 16.67,5 16,5H5A2,2 0 0,0 3,7V17A2,2 0 0,0 5,19H16C16.67,19 17.27,18.66 17.63,18.15L22,12L17.63,5.84Z"} /></svg>{cat==""?"Today":cat=="Live"?"Upcoming":cat}</MenuItem>
                {index==3 && <div style={{border:"1px solid rgb(46 46 46)"}}></div>}</>
            ))}
            </MenuItems>
    </SidebarContainer>
    </div>
  );
}

export default Sidebar;
