import Login from "./pages/Login/Login";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Leads from "./pages/Leads/Leads";
import type { Lead } from "./interfaces/Lead";
import Home from "./pages/Home/Home";
import Sidebar from "./components/Sidebar/Sidebar";
import Clients from "./pages/Clients/Clients";
import type { Client } from "./interfaces/Client";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import "./scss/App.scss";

function App() {
	const [leads, setLeads] = useState<Lead[]>([]);
	const [clients, setClients] = useState<Client[]>([]);
	const [session, setSession] = useState<Session | null>(null);
	const [authLoading, setAuthLoading] = useState(true);

	// TODO: LEARN THIS
	useEffect(() => {
		supabase.auth.getSession().then(({ data }) => {
			setSession(data.session);
			setAuthLoading(false);
		});

		const { data: listener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setSession(session);
			},
		);

		return () => listener.subscription.unsubscribe();
	}, []);

	const loadLeads = async () => {
		const { data } = await supabase
			.from("leads")
			.select("*")
			.order("updated_at", { ascending: false });
		setLeads(data ?? []);
	};

	const loadClients = async () => {
		const { data } = await supabase
			.from("clients")
			.select("*")
			.order("updated_at", { ascending: false });
		setClients(data ?? []);
	};

	useEffect(() => {
		if (session) {
			loadLeads();
			loadClients();
		}
	}, [session]);

	// TODO: learn this
	if (authLoading) return null;
	if (!session) return <Login />;

	return (
		<Router>
			<Routes>
				<Route path="/reset-password" element={<ResetPassword />} />
				<Route
					path="/*"
					element={
						<div className="layout">
							<Sidebar />
							<Routes>
								<Route path="/" element={<Home leads={leads} />} />
								<Route
									path="/leads"
									element={
										<Leads
											leads={leads}
											setLeads={setLeads}
											load={loadLeads}
											clients={clients}
										/>
									}
								/>
								<Route
									path="/clients"
									element={
										<Clients
											clients={clients}
											setClients={setClients}
											load={loadClients}
											leads={leads}
										/>
									}
								/>
							</Routes>
						</div>
					}
				/>
			</Routes>
		</Router>
	);
}

export default App;
