import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useNavigate } from "react-router-dom";
import "./styles.scss";

const ResetPassword = () => {
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setLoading(true);
		setError("");

		try {
			const { error } = await supabase.auth.updateUser({
				password,
			});

			if (error) throw error;
			alert("Пароль успішно змінено!");
			await supabase.auth.signOut();
			navigate("/login", { replace: true });
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Помилка відновлення пароля",
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="reset-password">
			<form className="reset-password-container" onSubmit={handleResetPassword}>
				<h1 style={{ textAlign: "center", fontSize: "1.5rem" }}>
					Відновлення пароля
				</h1>
				{error && <p>{error}</p>}
				<div className="reset-password-input-container">
					<label htmlFor="">Новий пароль</label>
					<input
						className=""
						type="password"
						placeholder="Новий пароль"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>
				<button type="submit" className="primary-btn" disabled={loading}>
					{loading ? "Зачекайте..." : "Змінити пароль"}
				</button>
			</form>
		</main>
	);
};

export default ResetPassword;
