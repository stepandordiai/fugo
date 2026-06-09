import Login from "./pages/Login/Login";
import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import type { Session } from "@supabase/supabase-js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Leads from "./pages/Leads/Leads";
import type { Lead } from "./interfaces/Lead";
import Home from "./pages/Home/Home";
import "./scss/App.scss";
import Sidebar from "./components/Sidebar/Sidebar";
import Clients from "./pages/Clients/Clients";
import type { Client } from "./interfaces/Client";

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

	const getAllLeads = async () =>
		supabase
			.from("leads")
			.select("*")
			.order("updated_at", { ascending: false });

	const getAllClients = async () =>
		supabase
			.from("clients")
			.select("*")
			.order("updated_at", { ascending: false });

	const loadLeads = async () => {
		const { data } = await getAllLeads();
		setLeads(data ?? []);
	};

	const loadClients = async () => {
		const { data } = await getAllClients();
		setClients(data ?? []);
	};

	useEffect(() => {
		if (session) loadLeads();
	}, [session]);

	useEffect(() => {
		if (session) loadClients();
	}, [session]);

	// TODO: learn this
	if (authLoading) return null; // or a spinner
	if (!session) return <Login />;
	return (
		<Router>
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
							/>
						}
					/>
				</Routes>
			</div>
		</Router>
	);
}

export default App;
