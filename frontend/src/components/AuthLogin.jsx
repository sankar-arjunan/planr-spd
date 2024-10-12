import { useNavigate } from "react-router-dom";
import { LoginContainer, Title, Login, PrimaryButton, SecondaryButton } from "./Utility";
import { useState, useEffect } from "react";
import { useCookies } from 'react-cookie';
import { toast } from 'react-toastify'; // Make sure to install react-toastify

function AuthLogin() {
    const navigate = useNavigate();
    const [cookies, setCookie] = useCookies(['jwt']);
    
    const [lform, setLForm] = useState({
        email: "",
        password: ""
    });

    const handleChanges = (e) => {
        const { name, value } = e.target;
        setLForm((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        console.log(`Input changed: ${name} = ${value}`); // Debug log
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log('Form Data:', lform); // Debug log
  
      // Basic input validation
      if (!lform.email || !lform.password) {
          toast.error("Please fill in all fields."); // Toast message
          return;
      }
  
      try {
          const response = await fetch('http://localhost:5000/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(lform),
          });
          
          const data = await response.json();
          console.log('Response:', data); // Debug log
  
          if (response.ok) {
              setCookie('jwt', data.token, { path: '/', maxAge: 3600 }); // Store the token
              navigate("/");
          } else {
              // If response is not ok, display an error message
              console.error(data.message);
              toast.error(data.message || "Login failed."); // Toast message
          }
      } catch (error) {
          console.error('Error during login:', error);
          toast.error("An unexpected error occurred."); // Toast message
      }
  };
  
    useEffect(() => {
        if (cookies.jwt) {
            const verifyToken = async () => {
                const response = await fetch('http://localhost:5000/verify', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${cookies.jwt}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    navigate("/"); // Redirect if token is valid
                } else {
                    console.error('Token verification failed');
                }
            };

            verifyToken();
        }
    }, [cookies, navigate]);

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
    };

    return (
        <div style={{ minWidth: "1080px" }}>
            <LoginContainer>
                <Title>
                    <h1>PLAN-R</h1>
                    <p>An Intelligent activity planner and tracker</p>
                </Title>
                <Login>
                    <h2 style={{ alignSelf: "center" }}>Login</h2>
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.formGroup}>
                            <label htmlFor="email" style={styles.label}>Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={lform.email}
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
                                value={lform.password}
                                onChange={handleChanges}
                                style={styles.input}
                            />
                        </div>
                        <PrimaryButton onClick={handleSubmit} >Login</PrimaryButton>
                        <SecondaryButton onClick={() => navigate("/forgot-password")}>Forgot Password</SecondaryButton>
                        <SecondaryButton onClick={() => navigate("/signup")}>Create new Account</SecondaryButton>
                    </form>
                </Login>
            </LoginContainer>
        </div>
    );
}

export default AuthLogin;
