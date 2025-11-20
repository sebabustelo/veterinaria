import React from 'react'
import './styleEstatico.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faInstagram, faTwitter } from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
    return (
        <footer>
            <div className="footer-content">
                <div className="footer-section" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem", gridColumn: "1 / -1" }}>
                    <div className="footer-social">
                        <a href="#" aria-label="Facebook">
                            <FontAwesomeIcon icon={faFacebook} className="footer-social-icon" />
                        </a>
                        <a href="#" aria-label="Twitter">
                            <FontAwesomeIcon icon={faTwitter} className="footer-social-icon" />
                        </a>
                        <a href="#" aria-label="Instagram">
                            <FontAwesomeIcon icon={faInstagram} className="footer-social-icon" />
                        </a>
                    </div>
                </div>
            </div>
            <div className="footer-bottom" style={{ textAlign: "center", justifyContent: "center" }}>
                <span>&copy; 2025 Vettix. Todos los derechos reservados.</span>
            </div>
        </footer>
    );
}

export default Footer;