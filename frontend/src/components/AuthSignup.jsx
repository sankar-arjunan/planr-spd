import { LoginContainer, Title, Login, PrimaryButton, SecondaryButton } from "./Utility";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from 'react-cookie';

function AuthSignup() {
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies(['jwt']);

    useEffect(() => {
        const checkAuth = async () => {
            const token = cookies.jwt;
            if (token) {
                try {
                    const response = await fetch('http://localhost:5000/verify', {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        navigate("/"); // Redirect if the token is valid
                    }
                } catch (error) {
                    console.error('Error verifying token:', error);
                }
            }
        };

        checkAuth();
    }, [cookies, navigate]);

    const [sform, setSForm] = useState({
        name: "",
        email: "",
        password: "",
        otp: "" 
    });

    const handleChanges = (e) => {
        const { name, value } = e.target;
        setSForm((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting form:', sform); // Debug log
        setLoading(true);

        try {
            if (!otpSent) {
                const response = await fetch('http://localhost:5000/auth/send-otp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: sform.email }),
                });

                if (response.ok) {
                    setOtpSent(true);
                } else {
                    const data = await response.json();
                    console.error(data.message);
                }
            } else {
                const response = await fetch('http://localhost:5000/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(sform),
                });

                const data = await response.json();
                if (response.ok) {
                    console.log(data);
                    setCookie('jwt', data.token, { path: '/', maxAge: 3600 });
                    navigate("/");
                } else {
                    console.error(data.message);
                }
            }
        } catch (error) {
            console.error('Error during form submission:', error);
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '32px',
            padding: '20px',
            maxWidth: '500px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
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
    };

    return (
        <div style={{ minWidth: "1080px" }}>
            <LoginContainer>
                <Title>
                    <h1>PLAN-R</h1>
                    <p>An Intelligent activity planner and tracker</p>
                </Title>
                <Login>
                    <h2 style={{ alignSelf: "center" }}>{otpSent ? "Verify OTP" : "Signup"}</h2>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label htmlFor="name" style={styles.label}>Name:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={sform.name}
                                onChange={handleChanges}
                                readOnly={otpSent}
                                style={styles.input}
                            />
                        </div>
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
                                    <label htmlFor="otp" style={styles.label}>6-digit One-Time PIN:</label>
                                    <input
                                        type="text"
                                        id="otp"
                                        name="otp"
                                        value={sform.otp}
                                        onChange={handleChanges}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label htmlFor="password" style={styles.label}>Password:</label>
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
                        <PrimaryButton onClick={handleSubmit} disabled={loading}>
                            {loading ? "Processing..." : (otpSent ? "Complete Signup" : "Send OTP")}
                        </PrimaryButton>
                    </form>
                    <SecondaryButton onClick={() => navigate("/login")}>Already have an account?</SecondaryButton>
                </Login>
            </LoginContainer>
        </div>
    );
}

export default AuthSignup;
