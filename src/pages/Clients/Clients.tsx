import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";
import type { Client } from "../../interfaces/Client";
import "./styles.scss";
import Menu from "../../components/Menu/Menu";

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
};

const Clients = ({ clients, load }: ClientsProps) => {
	const [isNew, setIsNew] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [form, setForm] = useState(EMPTY_FORM);
	const [error, setError] = useState<null | string>(null);
	const [filter, setFilter] = useState("");
	const [deleteModal, setDeleteModal] = useState(false);
	const [idToDelete, setIdToDelete] = useState("");
	const [formLoading, setFormLoading] = useState(false);

	// TODO: learn this
	const filteredClients = clients.filter((lead) =>
		Object.values(lead).some((value) =>
			String(value).toLowerCase().includes(filter.toLowerCase()),
		),
	);
	const [currentPage, setCurrentPage] = useState(1);

	const handleForm = (name: string, value: unknown) => {
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	useEffect(() => {
		document.documentElement.scrollTo(0, 0);
	}, [currentPage]);

	// Supabase
	const insertLead = async (data: Client) => {
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

	const updateLead = async (id: string, data: Client) => {
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

	const deleteLead = async (id: string) => {
		const { error } = await supabase.from("clients").delete().eq("id", id);
		if (error) console.error("Delete error:", error.message);
		else load();
	};

	// FIXME:
	const handleSave = async (form: any) => {
		if (isNew) {
			const ok = await insertLead(form);
			if (!ok) return;
		} else {
			await updateLead(form.id, form);
		}
		setForm(EMPTY_FORM);
		setIsNew(false);
		setModalVisible(false);
		await load();
	};

	const handleDelete = () => {
		deleteLead(idToDelete);
		setIdToDelete("");
		setDeleteModal(false);
	};

	const totalPages = Math.ceil(clients.length / 50);

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
				<div className="container">
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
															background: "var(--sec-accent-clr)",
															color: "#000",
															padding: "5px",
														}}
													>
														Новий
													</span>
												)}
											</td>
											<td>{l.tel}</td>
											<td style={{ maxWidth: "200px" }}>{l.details}</td>
											<td style={{ width: "1%" }}>
												<div style={{ display: "flex", gap: "5px" }}>
													<button
														className="update-btn"
														onClick={() => {
															setForm(l);
															setModalVisible(true);
															setIsNew(false);
														}}
													>
														Редагувати
														{/* <EditIcon size={20} /> */}
													</button>
													<button
														className="delete-btn"
														onClick={() => {
															(setDeleteModal(true), setIdToDelete(l.id));
														}}
													>
														Видалити
														{/* <TrashIcon size={20} /> */}
													</button>
												</div>
											</td>
										</tr>
									);
								})}
						</tbody>
					</table>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							padding: "10px 0",
							marginTop: "auto",
						}}
					>
						<div style={{ display: "flex", gap: "5px" }}>
							<p
								style={{
									color: "#fff",
									height: "40px",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									padding: "0 10px",
									borderRadius: "20px",
									fontWeight: "600",
								}}
							>
								{(currentPage - 1) * 50 + 1} -{" "}
								{Math.min(currentPage * 50, filteredClients.length)}
							</p>
							<p
								style={{
									color: "#fff",
									height: "40px",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
									padding: "0 10px",
									borderRadius: "20px",
									fontWeight: "600",
								}}
							>
								Всього: {filteredClients.length}
							</p>
						</div>
						<div style={{ display: "flex", gap: "5px" }}>
							{Array.from({ length: totalPages }, (_, i) => (
								<button
									key={i}
									onClick={() => setCurrentPage(i + 1)}
									className={`pag-btn ${currentPage === i + 1 ? "pag-btn--active" : ""}`}
								>
									{i + 1}
								</button>
							))}
						</div>
					</div>
				</div>
			</main>
		</>
	);
};

export default Clients;
