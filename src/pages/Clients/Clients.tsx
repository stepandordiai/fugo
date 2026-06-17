import { supabase } from "../../lib/supabase";
import { useState, useEffect, useRef } from "react";
import type { Client } from "../../interfaces/Client";
import Menu from "../../components/Menu/Menu";
import EditIcon from "../../components/icons/EditIcon";
import TrashIcon from "../../components/icons/TrashIcon";
import Pagination from "../../components/Pagination/Pagination";
import type { Lead } from "../../interfaces/Lead";
import "./styles.scss";

type ClientForm = Omit<Client, "created_at" | "updated_at">;

const EMPTY_FORM: ClientForm = {
	id: "",
	name: "",
	tel: "",
	details: "",
};

type ClientsProps = {
	clients: Client[];
	load: () => Promise<void>;
	setClients: React.Dispatch<React.SetStateAction<Client[]>>;
	leads: Lead[];
};

const Clients = ({ clients, load, leads }: ClientsProps) => {
	const [isNew, setIsNew] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [form, setForm] = useState(EMPTY_FORM);
	const [clientId, setClientId] = useState("");
	const [error, setError] = useState<null | string>(null);
	const [filter, setFilter] = useState("");
	const [deleteModal, setDeleteModal] = useState(false);
	const [idToDelete, setIdToDelete] = useState("");
	const [formLoading, setFormLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);

	const containerRef = useRef<HTMLDivElement | null>(null);

	// TODO: learn this
	const filteredClients = clients.filter((lead) =>
		Object.values(lead).some((value) =>
			String(value).toLowerCase().includes(filter.toLowerCase()),
		),
	);

	const handleForm = (name: string, value: unknown) => {
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	// Supabase
	const insertClient = async (data: Client) => {
		setError(null);
		setFormLoading(true);

		try {
			const { id, ...rest } = data;
			const { error } = await supabase.from("clients").insert([rest]);

			if (error) {
				if (error.code === "23505")
					setError("Клієнт з таким номером вже існує");
				else console.error("Insert error:", error.message);
				return false;
			}

			return true;
		} finally {
			setFormLoading(false);
		}
	};

	const updateClient = async (id: string, data: Client) => {
		setError(null);
		setFormLoading(true);

		try {
			const { id: _, ...rest } = data;
			const { error } = await supabase
				.from("clients")
				.update(rest)
				.eq("id", id);

			if (error) {
				if (error.code === "23505")
					setError("Клієнт з таким номером вже існує");
				else console.error("Insert error:", error.message);
				return false;
			}

			return true;
		} finally {
			setFormLoading(false);
		}
	};

	const deleteClient = async (id: string) => {
		const { error } = await supabase.from("clients").delete().eq("id", id);
		if (error) console.error("Delete error:", error.message);
		else load();
	};

	// FIXME:
	const handleSave = async (form: any) => {
		if (isNew) {
			const ok = await insertClient(form);
			if (!ok) return;
		} else {
			await updateClient(form.id, form);
		}
		setForm(EMPTY_FORM);
		setClientId("");
		setIsNew(false);
		setModalVisible(false);
		await load();
	};

	const handleDelete = () => {
		deleteClient(idToDelete);
		setIdToDelete("");
		setDeleteModal(false);
	};

	const totalPages = Math.ceil(clients.length / 50);

	const clientLeads = leads.filter(
		(l) => clientId && String(l.client_id) === String(clientId),
	);

	useEffect(() => {
		if (!containerRef.current) return;
		containerRef.current.scrollTo({
			top: 0,
			left: 0,
			behavior: "smooth",
		});
	}, [currentPage]);

	return (
		<>
			<div className={`modal ${modalVisible ? "modal--visible" : ""}`}>
				<div style={{ display: "flex", justifyContent: "space-between" }}>
					<p className="form__title">
						{isNew ? "Створити клієнт" : "Змінити клієнт"}
					</p>
					<button
						className="close-btn"
						onClick={() => {
							setModalVisible(false);
							setForm(EMPTY_FORM);
							setClientId("");
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="16"
							height="16"
							fill="currentColor"
							className="bi bi-x-lg"
							viewBox="0 0 16 16"
						>
							<path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
						</svg>
					</button>
				</div>
				{error && <p style={{ color: "red" }}>{error}</p>}
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSave(form);
					}}
				>
					<div className="input-container">
						<label htmlFor="name">Імя</label>
						<input
							id="name"
							className="input"
							onChange={(e) => handleForm(e.target.name, e.target.value)}
							value={form.name}
							name="name"
							type="text"
						/>
					</div>
					<div className="input-container">
						<label htmlFor="tel">Номер телефону</label>
						<input
							id="tel"
							className="input"
							onChange={(e) => handleForm(e.target.name, e.target.value)}
							value={form.tel}
							name="tel"
							type="text"
						/>
					</div>
					<div className="input-container">
						<label htmlFor="details">Повідомлення</label>
						<input
							id="details"
							className="input"
							onChange={(e) => handleForm(e.target.name, e.target.value)}
							value={form.details}
							name="details"
							type="text"
						/>
					</div>
					{clientLeads.length > 0 && (
						<div>
							Ліди
							{clientLeads.map((lead, i) => {
								return (
									<div key={lead.id}>
										<span>{i + 1} </span>
										<span>{lead.name} </span>
										<span>{lead.tel}</span>
									</div>
								);
							})}
						</div>
					)}
					<button className="form__submit-btn" type="submit">
						{formLoading
							? isNew
								? "Створення..."
								: "Збереження..."
							: isNew
								? "Створити"
								: "Змінити"}
					</button>
				</form>
			</div>
			<div
				onClick={() => {
					setModalVisible(false);
					setDeleteModal(false);
					setIsNew(false);
					setIdToDelete("");
					setForm(EMPTY_FORM);
					setClientId("");
				}}
				className={`main-curtain ${modalVisible || deleteModal ? "main-curtain--visible" : ""}`}
			></div>
			<div
				className={`delete-modal ${deleteModal ? "delete-modal--visible" : ""}`}
			>
				<strong>Ви точно хочете видалити цей запис?</strong>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(2, 1fr)",
						gap: "10px",
					}}
				>
					<button
						onClick={() => {
							setIdToDelete("");
							setDeleteModal(false);
						}}
						style={{
							height: "40px",
							padding: "0 10px",
							borderRadius: "20px",
							background: "#000",
							color: "#fff",
							fontWeight: 600,
						}}
					>
						Скасувати
					</button>
					<button
						style={{
							height: "40px",
							padding: "0 10px",
							borderRadius: "20px",
							background: "rgb(222, 92, 77)",
							color: "#fff",
							fontWeight: 600,
						}}
						onClick={() => handleDelete()}
					>
						Підтвердити
					</button>
				</div>
			</div>
			<main className="main">
				<Menu />
				<div style={{ display: "flex", justifyContent: "space-between" }}>
					<h1 className="main__title">Ліди</h1>
				</div>
				<div
					className="container-header"
					style={{
						position: "sticky",
						top: "0px",
						padding: "10px 0",
						display: "flex",
						color: "#fff",
						justifyContent: "space-between",
						background: "rgba(255, 255, 255, 0.1)",
					}}
				>
					<input
						className="search-input"
						onChange={(e) => setFilter(e.target.value)}
						value={filter}
						type="text"
						placeholder="Пошук"
					/>
					<button
						className="create-btn"
						onClick={() => {
							setIsNew(true);
							setModalVisible(true);
						}}
					>
						Новий клієнт
					</button>
				</div>
				<div ref={containerRef} className="container">
					<table>
						<thead>
							<tr>
								<th style={{ width: "1%" }}>№</th>
								<th>Ім'я</th>
								<th>Номер телефону</th>
								<th>Повідомлення</th>
								<th style={{ width: "1%" }}>Опції</th>
							</tr>
						</thead>
						<tbody>
							{filteredClients
								.slice((currentPage - 1) * 50, currentPage * 50)
								.map((l, i) => {
									const number = (currentPage - 1) * 50 + i + 1;

									const now = new Date();

									const diffMs =
										now.getTime() - new Date(l.created_at).getTime();

									const diffDays = diffMs / (1000 * 60 * 60 * 24);

									return (
										<tr key={l.id} className="leads-tr">
											<td style={{ width: "1%" }}>{number}</td>
											<td style={{ width: "1%", whiteSpace: "nowrap" }}>
												{l.name}{" "}
												{diffDays <= 3 && (
													<span
														style={{
															background: "#fd0a9c",
															color: "#fff",
															padding: "4px",
															borderRadius: "8px",
														}}
													>
														Новий
													</span>
												)}
											</td>
											<td>{l.tel}</td>
											<td style={{ maxWidth: "200px" }}>{l.details}</td>
											<td style={{ width: "1%" }}>
												<div
													style={{
														display: "flex",
														gap: "5px",
														width: "max-content",
													}}
												>
													<button
														className="update-btn"
														onClick={() => {
															setForm(l);
															setClientId(l.id);
															setModalVisible(true);
															setIsNew(false);
														}}
													>
														<EditIcon />
													</button>
													<button
														className="delete-btn"
														onClick={() => {
															(setDeleteModal(true), setIdToDelete(l.id));
														}}
													>
														<TrashIcon />
													</button>
												</div>
											</td>
										</tr>
									);
								})}
						</tbody>
					</table>
					<div className="table-container-footer">
						<div className="table-container-footer-inner">
							<p
								style={{
									padding: "var(--space-8)",
									borderRadius: "16px",
									background: "rgba(255,255,255,0.1)",
								}}
							>
								{(currentPage - 1) * 50 + 1} -{" "}
								{Math.min(currentPage * 50, filteredClients.length)}
							</p>
							<p
								style={{
									padding: "var(--space-8)",
									background: "rgba(255,255,255,0.1)",
									borderRadius: "16px",
								}}
							>
								Всього: {filteredClients.length}
							</p>
						</div>
						<Pagination
							totalPages={totalPages}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
						/>
					</div>
				</div>
			</main>
		</>
	);
};

export default Clients;
