export interface IEficientrometroProps {
  title: string;
  title_size: number;
  background: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  color: boolean;
  year: string | number;
  // totalValor: number;
  totalHoras: number;
}

export interface IEficientrometroCollectionDataProps {
  titulo: string;
  ano: string | number;
  horas: number;
  valor: number;
}

