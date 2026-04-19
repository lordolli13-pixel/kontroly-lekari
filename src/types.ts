export interface Doctor {
  id: number;
  name: string;
  icon: string;
  color: string;
}

export interface HealthEntry {
  id: number;
  person: string;
  date: string;
  time: string;
  doctor: string;
  note: string;
  color: string;
  notified: boolean;
}

export interface AppSettings {
  names: [string, string];
}
