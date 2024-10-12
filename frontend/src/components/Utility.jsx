import styled from "styled-components";

export const svgIconStyle = {
    fill: "#DDDDDD",
    height: "32px",
    width: "32px"
};

export const HeaderContainer = styled.div`
    background: black;
    color: #DDDDDD;
    padding: 12px 64px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    position: relative;
    border-bottom: 1px solid gray;
`;

export const HeaderSubContainer = styled.div`
    color: #DDDDDD;
    padding: 8px;
    display: flex;
    flex-direction: row;
    font-weight: 600;
    align-items: center;
    gap: 20px;
`;

export const SearchBar = styled.input`
    background: #1b1b1b;
    color: #DDDDDD;
    border-radius: 128px;
    padding: 16px 32px;
    border: 1px solid #303030;
    width: 100%;
    max-width: 800px;
    height: 16px;
    text-align: left;
    outline: none;
    font-size: 16px;

    &:focus {
        background: #303030;
        color: #FFFFFF;
    }
`;

export const PrimaryButton = styled.div`
    background: #1b1b1b;
    color: #DDDDDD;
    border-radius: 128px;
    padding: 16px 32px;
    border: 1px solid #303030;
    cursor: pointer;
    text-align: center;

    &:hover {
        background: #303030;
        color: #FFFFFF;
    }
`;

export const SecondaryButton = styled(PrimaryButton)`
    background: rgb(197 197 197);
    color: black;
`;

export const SidebarContainer = styled.div`
    position: fixed;
    background: black;
    color: #DDDDDD;
    padding: 32px 0 24px 0;
    margin-top: -120px;
    z-index: 0;
    display: flex;
    flex-direction: column;
    border-top: 1px solid #303030;
    height: 100vh;
    width: 250px;
    overflow-y: auto;
`;

export const TopCTA = styled.div`
    color: #DDDDDD;
    padding: 64px 16px 32px 16px;
    display: flex;
    flex-direction: column;
    font-weight: 600;
    align-items: center;
    gap: 20px;
`;

export const MenuItems = styled.div`
    color: #DDDDDD;
    display: flex;
    flex-direction: column;
    font-weight: 600;
    gap: 2px;
`;

export const MenuItem = styled.div`
    color: #DDDDDD;
    padding: 16px 32px;
    display: flex;
    flex-direction: row;
    font-weight: 600;
    align-items: center;
    gap: 20px;
    text-align: left;
    z-index: 3;
    cursor: pointer;
    text-transform: capitalize;

    &:hover {
        background: rgb(35 52 67);
        color: #FFFFFF;
    }
`;

export const BodyContainer = styled.div`
    background: white;
    color: black;
    padding: 24px 32px;
    display: flex;
    flex-direction: row;
    border-top: 1px solid #303030;
    height: 130vh;
    gap: 24px;
    margin-left: 250px;
    flex: 1;
    margin-bottom: 24px;
    overflow-y: auto;
`;

export const TaskGroup = styled.div`
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
`;

export const TaskItem = styled.div`
    background: rgb(247 247 247);
    color: black;
    padding: 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border: 1px solid #303030;
`;

export const EditPopup = styled(TaskGroup)`
    background: rgb(242 242 242);
    color: black;
    position: sticky;
    width : 100%;
    padding : 24px 48px;
`;

export const LoginContainer = styled.div`
    background: white;
    display: flex;
    flex-direction: column;
    gap: 24px;
    height: 100vh;
    align-items: center; /* Center horizontally */
    padding: 0 16px; /* Padding for responsiveness */
`;

export const Title = styled.div`
    background: black;
    color: white;
    width: 100%; /* Full width for title */
    text-align: center;
    padding: 16px; /* Padding for better spacing */
`;

export const AuthContainer = styled.div`
    background: #e8e8e8;
    display: flex;
    flex-direction: column;
    gap: 24px;
    justify-content: center;
    align-items: center; /* Center content */
    height: 70%;
    padding: 24px;
    width: 100%; /* Full width for responsiveness */
`;

export const Login = styled.div`
    background: white;
    display: flex;
    flex-direction: column;
    gap: 24px;
    justify-content: center;
    width: 100%; /* Full width */
    max-width: 400px; /* Maximum width for login form */
    padding: 24px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* Optional shadow for the login box */
`;

export const Signup = styled.div`
    background: white;
    padding: 24px;
    flex: 1;
`;

