import { NavLink } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "./styles.scss";

const Sidebar = () => {
	// TODO: LEARN THIS
	const handleLogout = async () => {
		await supabase.auth.signOut();
	};

	return (
		<aside className="sidebar">
			<div className="sidebar-top">
				<NavLink className="sidebar__logo" to="/">
					<span style={{ color: "#FFA600" }}>f</span>ugo
				</NavLink>
			</div>
			<nav className="sidebar-nav">
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
			<p style={{ color: "#fff" }}>
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
		</aside>
	);
};

export default Sidebar;
