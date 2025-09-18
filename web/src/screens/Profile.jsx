import React, { useState } from "react";
import './Profile.css';


function Profile({ onClose}) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!username || !password || !email) {
            alert("All fields are required");
            return;
        }
        if(!email.includes('@')) {
            alert("Invalid email address");
            return;
        }

    };
    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h2>Create Account</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />                   
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit">Create Account</button>
                </form>
                <br />
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}
export default Profile;