
import { Project, ProjectStatus, Collaborator, ConstructionDocument, Contract, Purchase, RDO } from './types';

export const PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Residencial Jardins',
    location: 'Zona Sul, SP',
    progress: 45,
    status: ProjectStatus.IN_PROGRESS,
    image: 'https://picsum.photos/seed/jardins/400/400'
  },
  {
    id: '2',
    name: 'Edifício Horizon',
    location: 'Centro, BH',
    progress: 72,
    status: ProjectStatus.COMPLETED,
    image: 'https://picsum.photos/seed/horizon/400/400'
  },
  {
    id: '3',
    name: 'Galpão Logístico Alpha',
    location: 'Ind. District, SP',
    progress: 5,
    status: ProjectStatus.IN_PROGRESS,
    image: 'https://picsum.photos/seed/alpha/400/400'
  }
];

export const COLLABORATORS: Collaborator[] = [
  {
    id: '1',
    name: 'Carlos Eduardo Mendes',
    role: 'Mestre de Obras',
    salary: 'R$ 4.500,00',
    currentProject: 'Residencial Vila Nova',
    photo: 'https://picsum.photos/seed/carlos/150/150'
  }
];

export const DOCUMENTS: ConstructionDocument[] = [
  { id: '1', name: 'Planta Baixa - Térreo_v04.pdf', date: '12/10/2023', author: 'João Silva (Arquiteto)', type: 'pdf' },
  { id: '2', name: 'Contrato Empreitada - Fase 2.pdf', date: '10/10/2023', author: 'Jurídico HLH', type: 'pdf' },
  { id: '3', name: 'Projeto Elétrico_Final.dwg', date: '05/10/2023', author: 'Carlos Eng.', type: 'dwg' },
  { id: '4', name: 'Visita Técnica - 01/10.jpg', date: '01/10/2023', author: 'Maria Souza', type: 'jpg' },
  { id: '5', name: 'Orçamento Revisado Set.xlsx', date: '28/09/2023', author: 'Financeiro', type: 'xlsx' }
];

export const CONTRACTS: Contract[] = [
  { id: '1', name: 'Fornecimento de Concreto', supplier: 'Concreta Mix Ltda', status: 'Ativo', expiry: '15/12/2023', code: 'CT-2023-089' },
  { id: '2', name: 'Mão de Obra - Pintura', supplier: 'Silva Acabamentos', status: 'Pendente', expiry: 'Assinatura pendente', code: 'CT-2023-092' },
  { id: '3', name: 'Instalação Elétrica Térreo', supplier: 'ElectroSol Engenharia', status: 'Atenção', expiry: 'Vence hoje', code: 'CT-2023-045' },
  { id: '4', name: 'Projeto Arquitetônico', supplier: 'Studio Arquitetura', status: 'Finalizado', expiry: 'Pago integralmente', code: 'CT-2022-110' }
];

export const PURCHASES: Purchase[] = [
  { id: '1', item: 'Cimento CP II', price: 'R$ 4.500,00', supplier: 'Votorantim', date: '12 out 2023', status: 'Pago', category: 'Material' },
  { id: '2', item: 'Tijolo 8 Furos', price: 'R$ 2.200,00', supplier: 'Cerâmica Silva', date: '10 out 2023', status: 'Pago', category: 'Material' },
  { id: '3', item: 'Locação Betoneira', price: 'R$ 350,00', supplier: 'Casa do Construtor', date: '08 out 2023', status: 'Pendente', category: 'Locação' },
  { id: '4', item: 'Tinta Acrílica Fosca', price: 'R$ 1.890,00', supplier: 'Suvinil', date: '05 out 2023', status: 'Pago', category: 'Material' }
];

export const RDOS: RDO[] = [
  { id: '1', date: '12', month: 'Out', day: 'Segunda-feira', status: 'Em Andamento', weather: '28°C Ensolarado', workers: 15, description: 'Concretagem da laje do 2º pavimento iniciada às 08h. Chegada de caminhões betoneira confirmada.' },
  { id: '2', date: '11', month: 'Out', day: 'Domingo', status: 'Finalizado', weather: 'Nublado', workers: 2, description: 'Obra sem atividades (Domingo). Apenas vigilância patrimonial presente.' },
  { id: '3', date: '10', month: 'Out', day: 'Sábado', status: 'Finalizado', weather: 'Chuva Tarde', workers: 12, description: 'Entrega de material cerâmico com atraso. Montagem de formas concluída.', hasIssue: true }
];
