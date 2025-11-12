import React from 'react'
import './styleEstatico.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram, faTwitter } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
    return (
        <footer >
            <div >
                <div className="footer-section" style={{ display: "flex", gap: "18px", alignItems: "center", justifyContent: "center" }}>
                    <a href="#" aria-label="Facebook">
                        <FontAwesomeIcon icon={faFacebook} style={{ color: "rgba(255, 255, 255, 0.95)", fontSize: "2.5rem" }} />
                    </a>
                    <a href="#" aria-label="Twitter">
                        <FontAwesomeIcon icon={faTwitter} style={{ color: "rgba(255, 255, 255, 0.95)", fontSize: "2.5rem" }} />
                    </a>
                    <a href="#" aria-label="Instagram">
                        <FontAwesomeIcon icon={faInstagram} style={{ color: "rgba(255, 255, 255, 0.95)", fontSize: "2.5rem" }} />
                    </a>
                </div>
                <div className="footer-section" style={{ display: "flex", gap: "1.5rem", alignItems: "center", justifyContent: "center", flexWrap: "wrap", fontSize: "1.2rem" }}>                    
                    <span> &copy; 2025 Vettix.</span>
                </div>
                
            </div>
        </footer>
    );
}

export default Footer;