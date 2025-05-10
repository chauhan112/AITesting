// remote-app/src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import ProfileCard from "./ProfileCard";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <div>
            <h1>Remote App Standalone Test</h1>
            <ProfileCard
                name="Remote User"
                title="Developer"
                avatarUrl="https://randomuser.me/api/portraits/men/75.jpg"
            />
        </div>
    </React.StrictMode>
);
