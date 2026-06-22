import { useState } from "react";
import XIcon from "../icons/XIcon";
import { NavLink } from "react-router-dom";
import MenuIcon from "../icons/MenuIcon";
import { supabase } from "../../lib/supabase";
import "./styles.scss";

const Menu = () => {
	const [menuVisible, setMenuVisible] = useState(false);

	// TODO: LEARN THIS
	const handleLogout = async () => {
		await supabase.auth.signOut();
	};

	return (
		<>
			<button
				className="menu-btn"
				onClick={() => setMenuVisible((prev) => !prev)}
			>
				<MenuIcon size={24} />
			</button>
			<div className={`menu ${menuVisible ? "menu--visible" : ""}`}>
				<button
					style={{
						color: "#fff",
						background: "rgba(255, 255, 255, 0.1)",
						alignSelf: "flex-end",
						padding: "0.75rem",
						display: "inline-flex",
						borderRadius: "12px",
					}}
					onClick={() => setMenuVisible(false)}
				>
					<XIcon size={24} />
				</button>
				<nav className="menu-nav">
					<NavLink
						className={({ isActive }) =>
							`sidebar-nav__link ${isActive ? "sidebar-nav__link--active" : ""}`
						}
						to="/"
					>
						Головна
					</NavLink>
					<NavLink
						className={({ isActive }) =>
							`sidebar-nav__link ${isActive ? "sidebar-nav__link--active" : ""}`
						}
						to="/leads"
					>
						Ліди
					</NavLink>
					<NavLink
						className={({ isActive }) =>
							`sidebar-nav__link ${isActive ? "sidebar-nav__link--active" : ""}`
						}
						to="/clients"
					>
						Клієнти
					</NavLink>
				</nav>
				<button className="logout-btn" onClick={handleLogout}>
					Вийти
				</button>
				<p style={{ color: "#fff", alignSelf: "center" }}>
					by{" "}
					<a
						style={{ color: "#fff" }}
						href="https://stepandordiai.netlify.app/"
						target="_blank"
						rel="noopener noreferrer"
					>
						STEPAN DORDIAI
					</a>
				</p>
			</div>
		</>
	);
};

export default Menu;
