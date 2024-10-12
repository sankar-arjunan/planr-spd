import React, { useState, useEffect } from 'react';
import { PrimaryButton, EditPopup, SecondaryButton, svgIconStyle } from './Utility'; // Import relevant component
import { useLocation, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';

const Notification = () => {

  const location = useLocation();
  const navigate = useNavigate();
  const [menu,setMenu] = useState(location.pathname);
  const [cookies] = useCookies(['jwt']);

  const [notificationType, setNotificationType] = useState("all");
  const radioStyle = {
    display: 'none',
  };

  const updateNotificationType = async (type) => {
    try {
      const response = await fetch('http://localhost:5000/auth/user/notification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cookies.jwt}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notification: type }),
      });

      if (!response.ok) throw new Error('Failed to update notification type');

      toast("Notification type updated successfully!");
    } catch (err) {
      toast("Error occurred while updating notification type");
    }
  };

  const fetchUserDetails = async () => {
    try {
        const response = await fetch('http://localhost:5000/auth/user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${cookies.jwt}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user details');
        }

        const data = await response.json();
        setNotificationType(data.notification);
    } catch (err) {
        toast("Error occured in notification type");
    }
};

useEffect(() => {
    fetchUserDetails();
}, []);

  const spanStyle = {
    display: 'inline-block',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '4px solid black',
    backgroundColor: '#fff',
    marginRight: '8px',
    position: 'relative',
    verticalAlign: 'middle',
  };

  const checkedSpanStyle = {
    ...spanStyle,
    backgroundColor:"black",
    borderColor: "black" ,
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    marginBottom: '8px',
  };

  const containerStyle = {
    display: 'flex',
    alignItems: 'center',
  };

    return(
        <EditPopup style={{height: "400px"}}>
            <PrimaryButton onClick={()=>navigate(menu)} style={{width:"90px", padding:"12px 20px 12px 16px", background:"white", color:"black"}}>Close</PrimaryButton>
            <div>
                <p style={{fontSize:"32px", fontWeight:"600"}}>Notifications</p>
                <p style={{fontSize:"20px", fontWeight:"400"}}>select notification type</p>
            </div>
            <div style={{display : "flex", flexDirection:"column", gap : "24px"}}>
      <div style={containerStyle}>
        <label style={labelStyle}>
          <input
            type="radio"
            name="option"
            value="all"
            checked={notificationType === 'all'}
            onChange={() => setNotificationType('all')}
            style={radioStyle}
          />
          <span style={notificationType === 'all' ? checkedSpanStyle : spanStyle} onClick={()=>updateNotificationType('all')}></span>
          Daily - All
        </label>
      </div>
      <div style={containerStyle}>
        <label style={labelStyle}>
          <input
            type="radio"
            name="option"
            value="priority only"
            checked={notificationType === "priority"}
            onChange={() => setNotificationType("priority")}
            style={radioStyle}
          />
          <span style={notificationType === "priority" ? checkedSpanStyle : spanStyle} onClick={()=>updateNotificationType('priority')}></span>
          Daily - Suggested
        </label>
      </div>
      <div style={containerStyle}>
        <label style={labelStyle}>
          <input
            type="radio"
            name="option"
            value="mute"
            checked={notificationType === 'mute'}
            onChange={() => setNotificationType('mute')}
            style={radioStyle}
          />
          <span style={notificationType === 'mute' ? checkedSpanStyle : spanStyle} onClick={()=>updateNotificationType('mute')}></span>
          Mute
        </label>
      </div>
    </div>
        </EditPopup>
    );
}

export default Notification;