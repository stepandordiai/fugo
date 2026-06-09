import type { Lead } from "../../interfaces/Lead";
import "./styles.scss";

type HomeProps = {
	leads: Lead[];
};

const Home = ({ leads }: HomeProps) => {
	return (
		<main className="main">
			<h1 className="main__title">Головна</h1>
			<h2>Ліди</h2>
			<div className="home-inner">
				<div className="home-container">
					<p>Всіх лідів</p>
					<p>{leads.length}</p>
				</div>
				<div className="home-container">
					<p>К-сть лідів "Чоловік"</p>
					<p>{leads.filter((l) => l.gender === "Чоловік").length}</p>
				</div>
				<div className="home-container">
					<p>К-сть лідів "Жінка"</p>
					<p>{leads.filter((l) => l.gender === "Жінка").length}</p>
				</div>
				<div className="home-container">
					<p>К-сть лідів статус "Новий"</p>
					<p>{leads.filter((l) => l.status === "Новий").length}</p>
				</div>
				<div className="home-container">
					<p>К-сть лідів статус "Знайшов роботу"</p>
					<p>{leads.filter((l) => l.status === "Знайшов роботу").length}</p>
				</div>
				<div className="home-container">
					<p>К-сть лідів статус "Працює"</p>
					<p>{leads.filter((l) => l.status === "Працює").length}</p>
				</div>
				<div className="home-container">
					<p>К-сть лідів статус "Неактивний"</p>
					<p>{leads.filter((l) => l.status === "Неактивний").length}</p>
				</div>
			</div>
		</main>
	);
};

export default Home;
