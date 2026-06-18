import { supabase } from "../../lib/supabase";
import { useState } from "react";
import "./styles.scss";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [authError, setAuthError] = useState("");
	const [authLoading, setAuthLoading] = useState(false);
	const [forgotPassword, setForgotPassword] = useState(false);

	// TODO: LEARN THIS
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setAuthLoading(true);
		setAuthError("");

		try {
			if (forgotPassword) {
				if (!email) {
					setAuthError("Введіть правильний електронний адрес");
					return;
				}

				const { error } = await supabase.auth.resetPasswordForEmail(email, {
					redirectTo: `${window.location.origin}/reset-password`,
				});

				if (error) throw error;
				// FIXME:
				alert("Лист для відновлення пароля відправлено");
				setForgotPassword(false);
				return;
			}

			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) throw error;
		} catch (error) {
			setAuthError(error instanceof Error ? error.message : "Помилка входу");
		} finally {
			setAuthLoading(false);
		}
	};

	return (
		<main className="login">
			<h1 style={{ fontSize: "2rem" }}>
				<span style={{ color: "#FFA600" }}>f</span>ugo
			</h1>
			{authError && <strong style={{ color: "red" }}>Access denied</strong>}
			<form className="login-form" onSubmit={handleSubmit}>
				<p style={{ fontSize: "2rem" }}>
					{forgotPassword ? "Забули пароль" : "Вхід"}
				</p>
				<div className="login-input-container">
					<label htmlFor="email">Логін</label>
					<input
						id="email"
						onChange={(e) => setEmail(e.target.value)}
						value={email}
						type="email"
						placeholder="example@gmail.com"
					/>
				</div>
				{!forgotPassword && (
					<div className="login-input-container">
						<label htmlFor="password">Пароль</label>
						<input
							id="password"
							onChange={(e) => setPassword(e.target.value)}
							value={password}
							type="password"
						/>
					</div>
				)}

				<button
					className="login-submit-btn"
					type="submit"
					disabled={authLoading}
				>
					{forgotPassword
						? authLoading
							? "Відновлення..."
							: "Відновити пароль"
						: authLoading
							? "Зачекайте..."
							: "Увійти"}
				</button>
				<button
					onClick={() => setForgotPassword((prev) => !prev)}
					style={{ textDecoration: "underline", textDecorationSkipInk: "none" }}
					type="button"
				>
					{forgotPassword ? "Вхід" : "Забули пароль?"}
				</button>
			</form>
		</main>
	);
};

export default Login;
