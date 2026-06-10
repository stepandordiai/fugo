export interface Lead {
	id: string;
	name: string;
	tel: string;
	gender: string;
	address: string;
	message: string;
	position: string;
	status: string;
	created_at: Date;
	updated_at: Date;
	messengers: { name: string; isAvailable: boolean }[];
	client_id: string;
}
