import { NavLink } from "react-router-dom";
// import HouseIcon from "@/components/icons/HouseIcon";
import { useState } from "react";
// import PeopleIcon from "@/components/icons/PeopleIcon";
// import CollectionIcon from "@/components/icons/CollectionIcon";
// import CollapseIcon from "@/components/icons/CollapseIcon";
// import { supabase } from "@/lib/supabase";
import { supabase } from "../../lib/supabase";
import "./styles.scss";

const Sidebar = () => {
	const [collapsed, setCollapsed] = useState(false);

	// TODO: LEARN THIS
	const handleLogout = async () => {
		await supabase.auth.signOut();
	};

	return (
		<aside className={`sidebar ${collapsed ? "sidebar--collapsed" : ""}`}>
			<div className="sidebar-top">
				<NavLink className="sidebar__logo" to="/">
					<span className={collapsed ? "label" : ""}>fugo</span>
				</NavLink>
				<button
					className="sidebar__collapse-btn"
					onClick={() => setCollapsed((prev) => !prev)}
				>
					{/* <CollapseIcon /> */}
				</button>
			</div>
			<nav className="sidebar-nav">
				<NavLink
					className={({ isActive }) =>
						`sidebar-nav__link ${isActive ? "sidebar-nav__link--active" : ""}`
					}
					to={"/"}
				>
					{/* <HouseIcon /> */}
					<span className={collapsed ? "label" : ""}>Головна</span>
				</NavLink>
				<NavLink
					className={({ isActive }) =>
						`sidebar-nav__link ${isActive ? "sidebar-nav__link--active" : ""}`
					}
					to={"/leads"}
				>
					{/* <PeopleIcon /> */}
					<span className={collapsed ? "label" : ""}>Ліди</span>
				</NavLink>
				<NavLink
					className={({ isActive }) =>
						`sidebar-nav__link ${isActive ? "sidebar-nav__link--active" : ""}`
					}
					to={"/clients"}
				>
					{/* <PeopleIcon /> */}
					<span className={collapsed ? "label" : ""}>Клієнти</span>
				</NavLink>
			</nav>

			<button className="logout-btn" onClick={handleLogout}>
				Вийти
			</button>
		</aside>
	);
};

export default Sidebar;
