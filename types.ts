
export enum ProjectStatus {
  IN_PROGRESS = 'Em Andamento',
  COMPLETED = 'Concluído'
}

export interface Project {
  id: string;
  name: string;
  location: string;
  progress: number;
  status: ProjectStatus;
  image: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  mapsUrl?: string;
}

export interface Collaborator {
  id: string;
  name: string;
  role: string;
  salary: string;
  currentProject: string;
  currentProjectId?: string;
  photo: string;
}

export interface ConstructionDocument {
  id: string;
  name: string;
  date: string;
  author: string;
  type: 'pdf' | 'dwg' | 'xlsx' | 'jpg';
  fileUrl?: string;
}

export interface Contract {
  id: string;
  name: string;
  supplier: string;
  status: 'Ativo' | 'Pendente' | 'Atenção' | 'Finalizado';
  expiry: string;
  code: string;
  value?: string;
}

export interface Purchase {
  id: string;
  item: string;
  price: string;
  supplier: string;
  date: string;
  status: 'Pago' | 'Pendente';
  category: 'Material' | 'Serviço' | 'Locação';
}

export interface RDO {
  id: string;
  date: string;
  day: string;
  month: string;
  status: 'Em Andamento' | 'Finalizado' | 'Rascunho';
  description: string;
  weather: string;
  workers: number;
  hasIssue?: boolean;
}
