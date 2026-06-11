import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";
import type { Lead } from "../../interfaces/Lead";
import type { Client } from "../../interfaces/Client";
import { trimValue } from "../../helpers/trimValue";
import "./styles.scss";
import Menu from "../../components/Menu/Menu";

const EMPTY_FORM: Lead = {
	id: "",
	name: "",
	tel: "",
	address: "",
	position: "",
	message: "",
	status: "Новий",
	gender: "",
	messengers: [],
	client_id: "",
	created_at: new Date(),
	updated_at: new Date(),
};

type LeadsProps = {
	leads: Lead[];
	load: () => Promise<void>;
	setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
	clients: Client[];
};

const Leads = ({ leads, setLeads, load, clients }: LeadsProps) => {
	const [isNew, setIsNew] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [form, setForm] = useState(EMPTY_FORM);
	const [error, setError] = useState<null | string>(null);
	const [filter, setFilter] = useState("");
	const [deleteModal, setDeleteModal] = useState(false);
	const [idToDelete, setIdToDelete] = useState("");
	const [formLoading, setFormLoading] = useState(false);
	const [deleteFormLoading, setDeleteFormLoading] = useState(false);
	const [updateState, setUpdateState] = useState(false);

	// TODO: learn this
	const filteredLeads = leads.filter((lead) =>
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
	const insertLead = async (data: Lead) => {
		setError(null);
		setFormLoading(true);

		try {
			const { id, tel, created_at, updated_at, ...rest } = data;

			const { error } = await supabase
				.from("leads")
				.insert([{ tel: trimValue(tel), ...rest }]);

			if (error) {
				if (error.code === "23505") setError("Лід з таким номером вже існує");
				else console.error("Insert error:", error.message);
				return false;
			}

			return true;
		} finally {
			setFormLoading(false);
		}
	};

	const updateLead = async (id: string, data: Lead) => {
		setError(null);
		setFormLoading(true);

		try {
			const { id: _, tel, created_at, updated_at, ...rest } = data;
			const { error } = await supabase
				.from("leads")
				.update({ tel: trimValue(tel), ...rest })
				.eq("id", id);

			if (error) {
				if (error.code === "23505") setError("Лід з таким номером вже існує");
				else console.error("Insert error:", error.message);
				return false;
			}

			return true;
		} finally {
			setFormLoading(false);
		}
	};

	const deleteLead = async (id: string) => {
		setDeleteFormLoading(true);

		try {
			const { error } = await supabase.from("leads").delete().eq("id", id);
			if (error) throw error;
			load();
		} catch (error) {
			console.error("Delete error:", error);
		} finally {
			setDeleteFormLoading(false);
			setForm(EMPTY_FORM);
			setModalVisible(false);
			setDeleteModal(false);
			setIdToDelete("");
		}
	};

	// FIXME:
	const handleSave = async (form: any) => {
		if (isNew) {
			const ok = await insertLead(form);
			if (!ok) return;
		} else {
			await updateLead(form.id, form);
		}
		setIsNew(false);
		setUpdateState(false);
		await load();
	};

	const handleDelete = () => {
		deleteLead(idToDelete);
	};

	const toggleIsWorking = async (id: string, value: string) =>
		supabase.from("leads").update({ status: value }).eq("id", id);

	const handleStatus = async (id: string, current: string) => {
		await toggleIsWorking(id, current);
		setLeads((prev) =>
			prev.map((v) => (v.id === id ? { ...v, status: current } : v)),
		);
	};

	const handleMessenger = (value: string, checked: boolean) => {
		const current = form.messengers ?? [];
		const exists = current.find((m) => m.name === value);

		const updated = exists
			? current.map((m) =>
					m.name === value ? { ...m, isAvailable: checked } : m,
				)
			: [...current, { name: value, isAvailable: checked }];
		handleForm("messengers", updated);
	};

	const toggleClient = async (id: string, value: string) =>
		supabase.from("leads").update({ client_id: value }).eq("id", id);

	const handleClientChange = async (leadId: string, clientId: string) => {
		await toggleClient(leadId, clientId);
		setLeads((prev) =>
			prev.map((lead) =>
				lead.id === leadId ? { ...lead, client_id: clientId } : lead,
			),
		);
	};

	const totalPages = Math.ceil(leads.length / 50);

	return (
		<>
			<div className={`modal ${modalVisible ? "modal--visible" : ""}`}>
				<button
					className="close-btn"
					onClick={() => {
						setModalVisible(false);
						setForm(EMPTY_FORM);
						setUpdateState(false);
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
				<div style={{ display: "flex", justifyContent: "space-between" }}>
					<p className="form__title">
						{isNew ? "Створити лід" : "Змінити лід"}
					</p>
				</div>
				{error && <p style={{ color: "red" }}>{error}</p>}
				<form
					onSubmit={(e) => {
						e.preventDefault();
						handleSave(form);
					}}
				>
					{!isNew && (
						<div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
							<div>
								<p>Створено</p>
								<p>
									{new Date(form.created_at).toLocaleDateString()}{" "}
									{new Date(form.created_at).toLocaleTimeString()}
								</p>
							</div>
							<div>
								<p>Оновлено</p>
								<p>
									{new Date(form.updated_at).toLocaleDateString()}{" "}
									{new Date(form.updated_at).toLocaleTimeString()}
								</p>
							</div>
						</div>
					)}
					<div className="input-container">
						<label htmlFor="name">Імя</label>
						<input
							id="name"
							className={`input ${!isNew && !updateState ? "input--disabled" : ""}`}
							onChange={(e) => handleForm(e.target.name, e.target.value)}
							value={form.name}
							name="name"
							type="text"
							disabled={!isNew && !updateState}
						/>
					</div>
					<div className="input-container">
						<label htmlFor="tel">Номер телефону</label>
						<input
							id="tel"
							className={`input ${!isNew && !updateState ? "input--disabled" : ""}`}
							onChange={(e) => handleForm(e.target.name, e.target.value)}
							value={form.tel}
							name="tel"
							type="text"
							disabled={!isNew && !updateState}
						/>
					</div>
					<div>
						<label htmlFor="">Месенджери</label>
						<div style={{ display: "flex", flexWrap: "wrap" }}>
							{(["whatsapp", "telegram", "viber"] as const).map((name) => {
								const messenger = form.messengers?.find((m) => m.name === name);
								const isAvailable = messenger?.isAvailable;

								return (
									<div key={name}>
										<label style={{ textTransform: "capitalize" }}>
											{name}
										</label>
										<div style={{ display: "flex" }}>
											<label>
												<input
													type="radio"
													checked={isAvailable === true}
													onChange={() => handleMessenger(name, true)}
													disabled={!isNew && !updateState}
												/>
												Так
											</label>
											<label>
												<input
													type="radio"
													checked={isAvailable === false}
													onChange={() => handleMessenger(name, false)}
													disabled={!isNew && !updateState}
												/>
												Ні
											</label>
										</div>
									</div>
								);
							})}
						</div>
					</div>
					<div className="input-container">
						<label>Стать</label>
						<div style={{ display: "flex" }}>
							<label>
								<input
									type="radio"
									name="gender"
									value="Жінка"
									checked={form.gender === "Жінка"}
									onChange={(e) => handleForm(e.target.name, e.target.value)}
									disabled={!isNew && !updateState}
								/>
								Жінка
							</label>
							<label>
								<input
									type="radio"
									name="gender"
									value="Чоловік"
									checked={form.gender === "Чоловік"}
									onChange={(e) => handleForm(e.target.name, e.target.value)}
									disabled={!isNew && !updateState}
								/>
								Чоловік
							</label>
						</div>
					</div>
					<div className="input-container">
						<label htmlFor="address">Адреса</label>
						<input
							id="address"
							className={`input ${!isNew && !updateState ? "input--disabled" : ""}`}
							onChange={(e) => handleForm(e.target.name, e.target.value)}
							value={form.address}
							name="address"
							type="text"
							disabled={!isNew && !updateState}
						/>
					</div>
					<div className="input-container">
						<label htmlFor="position">Позиція</label>
						<input
							id="position"
							className={`input ${!isNew && !updateState ? "input--disabled" : ""}`}
							onChange={(e) => handleForm(e.target.name, e.target.value)}
							value={form.position}
							name="position"
							type="text"
							disabled={!isNew && !updateState}
						/>
					</div>
					<div className="input-container">
						<label htmlFor="message">Повідомлення</label>
						<input
							id="message"
							className={`input ${!isNew && !updateState ? "input--disabled" : ""}`}
							onChange={(e) => handleForm(e.target.name, e.target.value)}
							value={form.message}
							name="message"
							type="text"
							disabled={!isNew && !updateState}
						/>
					</div>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							flexWrap: "wrap",
							gap: "4px",
							position: "sticky",
							bottom: 0,
						}}
					>
						{!isNew && (
							<div style={{ display: "flex", gap: "5px" }}>
								<button
									type="button"
									className="update-btn"
									onClick={() => {
										setUpdateState(true);
									}}
								>
									Редагувати
								</button>
								<button
									type="button"
									className="delete-btn"
									onClick={() => {
										(setDeleteModal(true), setIdToDelete(form.id));
									}}
								>
									Видалити
								</button>
							</div>
						)}
						<div style={{ display: "flex", gap: "4px" }}>
							{updateState && (
								<button
									onClick={() => setUpdateState(false)}
									className={`form__submit-btn ${!updateState && !isNew ? "form__submit-btn--disabled" : ""}`}
									type="button"
									disabled={!updateState && !isNew}
								>
									Скасувати
								</button>
							)}
							<button
								className={`form__submit-btn ${!updateState && !isNew ? "form__submit-btn--disabled" : ""}`}
								type="submit"
								disabled={!updateState && !isNew}
							>
								{formLoading
									? isNew
										? "Створення..."
										: "Збереження..."
									: isNew
										? "Створити"
										: "Змінити"}
							</button>
						</div>
					</div>
				</form>
			</div>
			<div
				onClick={() => {
					setModalVisible(false);
					setDeleteModal(false);
					setIsNew(false);
					setIdToDelete("");
					setForm(EMPTY_FORM);
					setUpdateState(false);
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
						onClick={handleDelete}
					>
						{deleteFormLoading ? "Видалення..." : "Підтвердити"}
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
						Новий лід
					</button>
				</div>
				<div className="container">
					<table>
						<thead>
							<tr>
								<th style={{ width: "1%" }}>№</th>
								<th>Ім'я</th>
								<th>Номер телефону</th>
								<th>Мессенджери</th>
								<th>Стать</th>
								<th>Адреса</th>
								<th>Позиція</th>
								<th>Повідомлення</th>
								<th style={{ width: "1%" }}>Статус</th>
								<th style={{ width: "1%" }}>Клієнт</th>
								<th style={{ width: "1%" }}>Опції</th>
							</tr>
						</thead>
						<tbody>
							{filteredLeads
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
											<td>
												<div style={{ display: "flex", gap: "5px" }}>
													{l.messengers
														.filter((m) => m.isAvailable)
														.map((m, i) => (
															<img
																key={i}
																src={`${m.name}.svg`}
																width={20}
																height={20}
																alt={m.name}
															/>
														))}
													{l.messengers
														.filter((m) => !m.isAvailable)
														.map((m, i) => (
															<div
																key={m.name}
																style={{ position: "relative" }}
															>
																<img
																	key={i}
																	src={`${m.name}.svg`}
																	width={20}
																	height={20}
																	alt={m.name}
																/>
																<span
																	style={{ position: "absolute", inset: "0" }}
																>
																	<svg
																		xmlns="http://www.w3.org/2000/svg"
																		width="100%"
																		height="100%"
																		fill="red"
																		className="bi bi-x-lg"
																		viewBox="0 0 16 16"
																	>
																		<path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
																	</svg>
																</span>
															</div>
														))}
												</div>
											</td>
											<td>{l.gender}</td>
											<td>{l.address}</td>
											<td>{l.position}</td>
											<td style={{ maxWidth: "200px" }}>{l.message}</td>
											<td style={{ width: "1%", whiteSpace: "nowrap" }}>
												<select
													className={`status-select ${l.status === "Знайшов роботу" ? "status-select--orange" : l.status === "Працює" ? "status-select--blue" : l.status === "Неактивний" ? "status-select--red" : ""}`}
													name="status"
													id="status"
													onChange={(e) => handleStatus(l.id, e.target.value)}
													value={l.status || ""}
												>
													<option value="Новий">Новий</option>
													<option value="Знайшов роботу">Знайшов роботу</option>
													<option value="Працює">Працює</option>
													<option value="Неактивний">Неактивний</option>
												</select>
											</td>
											<td style={{ width: "1%", whiteSpace: "nowrap" }}>
												{l.status === "Працює" && (
													<select
														className="status-select"
														value={l.client_id || ""}
														onChange={(e) =>
															handleClientChange(l.id, e.target.value)
														}
													>
														<option value="">Оберіть клієнта</option>

														{clients.map((client) => (
															<option key={client.id} value={client.id}>
																{client.name}
															</option>
														))}
													</select>
												)}
											</td>
											<td style={{ width: "1%" }}>
												<button
													className="update-btn"
													onClick={() => {
														setModalVisible(true);
														setForm(l);
														setIsNew(false);
													}}
												>
													Details
												</button>
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
								{Math.min(currentPage * 50, filteredLeads.length)}
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
								Всього: {filteredLeads.length}
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

export default Leads;
