// remote-app/src/ProfileCard.js
import React from "react";

const ProfileCard = ({ name, title, avatarUrl }) => {
    const cardStyle = {
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "20px",
        margin: "10px",
        maxWidth: "300px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        backgroundColor: "#f9f9f9",
    };
    const avatarStyle = {
        width: "100px",
        height: "100px",
        borderRadius: "50%",
        objectFit: "cover",
        marginBottom: "15px",
    };
    const nameStyle = {
        fontSize: "1.5em",
        margin: "0 0 5px 0",
        color: "#333",
    };
    const titleStyle = {
        fontSize: "1em",
        color: "#777",
        margin: "0",
    };

    return (
        <div style={cardStyle}>
            <img
                src={avatarUrl || "https://via.placeholder.com/100"}
                alt={name}
                style={avatarStyle}
            />
            <h2 style={nameStyle}>{name || "User Name"}</h2>
            <p style={titleStyle}>{title || "User Title"}</p>
            <button
                onClick={() => alert(`Contacting ${name}...`)}
                style={{
                    marginTop: "15px",
                    padding: "8px 15px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
            >
                Contact
            </button>
        </div>
    );
};

export default ProfileCard;
