import Chart from "../../components/Chart/Chart";
import type { Lead } from "../../interfaces/Lead";
import Menu from "../../components/Menu/Menu";
import "./styles.scss";

type HomeProps = {
	leads: Lead[];
};

const Home = ({ leads }: HomeProps) => {
	return (
		<>
			<main className="main">
				<Menu />
				<h1 className="main__title">Головна</h1>
				<h2>Ліди</h2>
				<div className="charts-container">
					<div>
						<Chart
							items={leads}
							stats={[
								{
									label: "Чоловік",
									color: "var(--accent-clr)",
									filter: (l) => l.gender === "Чоловік",
								},
								{
									label: "Жінка",
									color: "var(--accent-clr)",
									filter: (l) => l.gender === "Жінка",
								},
								{
									label: "Інше",
									color: "var(--accent-clr)",
									filter: (l) => l.gender !== "Чоловік" && l.gender !== "Жінка",
								},
							]}
							label="Кількість"
						/>
					</div>
					<div>
						<Chart
							items={leads}
							stats={[
								{
									label: "Новий",
									color: "var(--accent-clr)",
									filter: (l) => l.status === "Новий",
								},
								{
									label: "Знайшов роботу",
									color: "var(--accent-clr)",
									filter: (l) => l.gender === "Знайшов роботу",
								},
								{
									label: "Працює",
									color: "var(--accent-clr)",
									filter: (l) => l.status === "Працює",
								},
								{
									label: "Неактивний",
									color: "var(--accent-clr)",
									filter: (l) => l.status === "Неактивний",
								},
							]}
							label="Кількість"
						/>
					</div>
					<div>
						<Chart
							items={leads}
							stats={[
								{
									label: "Telegram",
									color: "var(--accent-clr)",
									filter: (l) =>
										l.messengers.some(
											(m) => m.name === "telegram" && m.isAvailable,
										),
								},
								{
									label: "Viber",
									color: "var(--accent-clr)",
									filter: (l) =>
										l.messengers.some(
											(m) => m.name === "viber" && m.isAvailable,
										),
								},
								{
									label: "Whatsapp",
									color: "var(--accent-clr)",
									filter: (l) =>
										l.messengers.some(
											(m) => m.name === "whatsapp" && m.isAvailable,
										),
								},
								// {
								// 	label: "Неактивний",
								// 	color: "var(--accent-clr)",
								// 	filter: (l) => l.status === "Неактивний",
								// },
							]}
							label="Кількість"
						/>
					</div>
				</div>
			</main>
		</>
	);
};

export default Home;
