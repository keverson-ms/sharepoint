export interface IEficientrometroProps {
  title: string;
  title_size: number;
  background: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  color: boolean;
  year: number;
  totalValores: string;
  totalHoras: string;
}

export interface IEficientrometroCollectionDataProps {
  titulo: string;
  ano: string | number;
  horas: number;
  valor: number;
}

