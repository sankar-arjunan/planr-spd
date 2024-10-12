import React, { useState, useEffect } from 'react';
import { PrimaryButton, EditPopup } from './Utility'; // Import relevant components
import { useLocation, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';

const Account = () => {
    const navigate = useNavigate();
    const [cookies, setCookie, removeCookie] = useCookies(['jwt']);
    const [userDetails, setUserDetails] = useState(null);
    const [error, setError] = useState(null);
    const [menu, setMenu]= useState(useLocation().pathname);

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
            setUserDetails(data);
        } catch (err) {
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchUserDetails();
    }, []);

    const closeAndLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${cookies.jwt}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to log out');
            }

            // Clear cookies and navigate to login
            removeCookie('jwt');
            navigate('/login');
        } catch (err) {
            setError(err.message);
        }
    };

    const deleteAccount = async () => {
        try {
            const response = await fetch('http://localhost:5000/auth/user', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${cookies.jwt}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to log out');
            }
            toast(response.message);
            removeCookie('jwt');
            navigate('/login');
        } catch (err) {

            setError(err.message);
        }
    };



    const handleChangePassword = () => {
        navigate("/forgot-password");
    };

    return (
        <EditPopup style={{ height: "460px" }}>
            <PrimaryButton onClick={()=>navigate(menu)} style={{ width: "90px", padding: "12px 20px 12px 16px", background: "white", color: "black" }}>Close</PrimaryButton>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {userDetails ? (
                <div>
                    <p style={{ fontSize: "32px", fontWeight: "600" }}>{userDetails.name}</p>
                    <p style={{ fontSize: "20px", fontWeight: "400" }}>{userDetails.email}</p>
                </div>
            ) : (
                <p>Loading user details...</p>
            )}
            <PrimaryButton onClick={handleChangePassword} style={{ background: "transparent", color: "#1b1b1b" }}>Change Password</PrimaryButton>
            <PrimaryButton style={{ background: "transparent", borderColor: "#c94747", color: "#c94747" }} onClick={closeAndLogout}>Logout</PrimaryButton>
            <PrimaryButton style={{ background: "#c94747" }} onClick={deleteAccount}>Delete Account</PrimaryButton>
        </EditPopup>
    );
}

export default Account;
