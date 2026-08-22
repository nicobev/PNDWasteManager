import TextInput from "../components/TextInput";
import Button from "../components/Button";
import hero from "../assets/images/hero.png"
import "/src/assets/styles/login.css";


function Login(){
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login submitted.') // Connect to API later.
    };

    return (
        <div id='login-screen'>
            <div id="login-header">
                <img src={hero} alt="Panda Express Logo"></img>
            </div>
            <div id="login-frame">
                <form onSubmit={handleSubmit}>
                    <TextInput fieldName="Username" placeholder="Enter username" id="username" />
                    <TextInput fieldName="Password" type="password" placeholder="Enter password" id="password" />
                    <a href="#">Forgot password?</a>
                    <Button type='submit' buttonText='Log in' style={{color:'white', backgroundColor:'var(--primary-color)'}}/>
                </form>
            </div>
            <div id="login-footer">
                <p>Version 1.0 | Secure Login | © 2026 Panda Restaurant Group. All rights reserved. </p>
            </div>
        </div>
    );
}

export default Login;