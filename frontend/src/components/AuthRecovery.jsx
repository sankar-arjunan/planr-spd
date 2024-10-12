import { LoginContainer, Title, Login, PrimaryButton } from "./Utility";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify';

function AuthRecovery() {
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies(['jwt']);

    const [sform, setSForm] = useState({
        email: "",
        password: "",
        otp: ""  // Changed from pin to otp
    });

    const handleChanges = (e) => {
        const { name, value } = e.target;
        console.log(`Input changed: ${name} = ${value}`); // Debug log for input changes
        setSForm((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form Data before submission:', sform); // Debug log for form data
        setLoading(true);

        try {
            if (!otpSent) {
                // Send OTP to the user's email
                console.log('Sending OTP to:', sform.email); // Debug log for OTP sending
                const response = await fetch('http://localhost:5000/auth/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: sform.email }),
                });

                const data = await response.json();
                console.log('Send OTP response:', data); // Debug log for response

                if (response.ok) {
                    setOtpSent(true);
                    toast.success("OTP sent to your email."); // Toast message
                } else {
                    toast.error(data.message || "Failed to send OTP."); // Toast message
                }
            } else {
                // Verify OTP and reset the password
                console.log('Verifying OTP:', sform.otp); // Debug log for OTP verification
                const response = await fetch('http://localhost:5000/auth/recovery', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sform),
                });

                const data = await response.json();
                console.log('Recovery response:', data); // Debug log for recovery response

                if (response.ok) {
                    toast.success("Password has been reset successfully."); // Toast message
                    navigate("/login");
                } else {
                    toast.error(data.message || "Failed to reset password."); // Toast message
                }
            }
        } catch (error) {
            console.error('Error during password recovery:', error);
            toast.error("An unexpected error occurred."); // Toast message
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = cookies.jwt;
            if (token) {
                try {
                    console.log('Checking token:', token); // Debug log for token check
                    const response = await fetch('http://localhost:5000/verify', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        console.log('Token is valid, redirecting...'); // Debug log for valid token
          
                    }
                } catch (error) {
                    console.error('Error verifying token:', error);
                }
            } else {
                console.log('No token found'); // Debug log for no token
            }
        };

        checkAuth();
    }, [cookies, navigate]);

    const styles = {
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            padding: '20px',
            maxWidth: '500px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        },
        formGroup: {
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
        },
        label: {
            fontSize: '16px',
            fontWeight: 'bold',
            textAlign: "left",
        },
        input: {
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
        },
    };

    return (
        <div style={{ minWidth: "1080px" }}>
            <LoginContainer>
                <Title>
                    <h1>PLAN-R</h1>
                    <p>An Intelligent activity planner and tracker</p>
                </Title>
                <Login>
                    <h2 style={{ alignSelf: "center" }}>Account Recovery</h2>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label htmlFor="email" style={styles.label}>Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={sform.email}
                                onChange={handleChanges}
                                readOnly={otpSent}
                                style={styles.input}
                            />
                        </div>
                        {otpSent && (
                            <>
                                <div style={styles.formGroup}>
                                    <label htmlFor="otp" style={styles.label}>6-digit One-Time OTP:</label>
                                    <input
                                        type="text"
                                        id="otp"
                                        name="otp"  // Changed from pin to otp
                                        value={sform.otp}
                                        onChange={handleChanges}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label htmlFor="password" style={styles.label}>New Password:</label>
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        value={sform.password}
                                        onChange={handleChanges}
                                        style={styles.input}
                                    />
                                </div>
                            </>
                        )}
                        <PrimaryButton onClick={handleSubmit} type="submit" disabled={loading}>
                            {loading ? "Processing..." : (otpSent ? "Update Password" : "Send OTP")}
                        </PrimaryButton>
                    </form>
                </Login>
            </LoginContainer>
        </div>
    );
}

export default AuthRecovery;
