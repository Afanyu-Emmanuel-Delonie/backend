export type WorkerRole = "FARM_OWNER" | "FRONT_DESK" | "HERDER" | "MILKER" | "VET_TECHNICIAN" | "GENERAL_LABOR";
export type EmploymentStatus = "ACTIVE" | "ON_LEAVE" | "FORMER";

export type Worker = {
  id: number;
  name: string;
  role: WorkerRole;
  phone: string;
  startDate: string;
  status: EmploymentStatus;
  /** Monthly wage in RWF. Omitted for the owner, who draws profit rather than a wage. */
  monthlySalary?: number;
};

export const seedWorkers: Worker[] = [
  { id: 1, name: "Jean-Baptiste Nshimiyimana", role: "FARM_OWNER", phone: "+250 788 100 201", startDate: "2018-02-01", status: "ACTIVE" },
  { id: 2, name: "Claudine Uwimana", role: "FRONT_DESK", phone: "+250 788 100 202", startDate: "2021-04-12", status: "ACTIVE", monthlySalary: 120_000 },
  { id: 3, name: "Emmanuel Habimana", role: "HERDER", phone: "+250 788 100 203", startDate: "2020-09-03", status: "ACTIVE", monthlySalary: 85_000 },
  { id: 4, name: "Alice Mukamana", role: "MILKER", phone: "+250 788 100 204", startDate: "2022-01-17", status: "ACTIVE", monthlySalary: 80_000 },
  { id: 5, name: "Eric Nkurunziza", role: "MILKER", phone: "+250 788 100 205", startDate: "2022-06-25", status: "ACTIVE", monthlySalary: 80_000 },
  { id: 6, name: "Dr. Jean Mugisha", role: "VET_TECHNICIAN", phone: "+250 788 100 206", startDate: "2023-02-14", status: "ACTIVE", monthlySalary: 150_000 },
  { id: 7, name: "Patrick Niyonzima", role: "GENERAL_LABOR", phone: "+250 788 100 207", startDate: "2023-08-01", status: "ACTIVE", monthlySalary: 65_000 },
  { id: 8, name: "Solange Ingabire", role: "GENERAL_LABOR", phone: "+250 788 100 208", startDate: "2022-11-20", status: "ON_LEAVE", monthlySalary: 65_000 },
  { id: 9, name: "Vincent Rugamba", role: "HERDER", phone: "+250 788 100 209", startDate: "2019-05-06", status: "FORMER", monthlySalary: 85_000 },
];
