// shell-app/src/App.js
import React, { Suspense } from "react";

// Dynamically import the remote component
// 'remoteApp' is the name given in remote's ModuleFederationPlugin
// '/ProfileCard' is the alias for the exposed component
const RemoteProfileCard = React.lazy(() => import("remoteApp/ProfileCard"));

const App = () => {
    return (
        <div
            style={{
                fontFamily: "Arial, sans-serif",
                padding: "20px",
                backgroundColor: "#e9ecef",
            }}
        >
            <header
                style={{
                    backgroundColor: "#343a40",
                    color: "white",
                    padding: "20px",
                    textAlign: "center",
                    marginBottom: "30px",
                    borderRadius: "5px",
                }}
            >
                <h1>Shell Application</h1>
                <p>
                    This application consumes components from a remote
                    micro-frontend.
                </p>
            </header>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-around",
                    flexWrap: "wrap",
                }}
            >
                <Suspense fallback={<div>Loading Profile Card...</div>}>
                    <RemoteProfileCard
                        name="Alice from Shell"
                        title="Lead Engineer"
                        avatarUrl="https://randomuser.me/api/portraits/women/65.jpg"
                    />
                </Suspense>

                <Suspense fallback={<div>Loading Another Profile Card...</div>}>
                    <RemoteProfileCard
                        name="Bob (Shell Data)"
                        title="Product Manager"
                        avatarUrl="https://randomuser.me/api/portraits/men/32.jpg"
                    />
                </Suspense>
            </div>

            <div
                style={{
                    marginTop: "30px",
                    padding: "15px",
                    backgroundColor: "white",
                    borderRadius: "5px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
            >
                <h2>Content Local to Shell App</h2>
                <p>
                    This is some content that lives directly within the shell
                    application.
                </p>
            </div>
        </div>
    );
};

export default App;
