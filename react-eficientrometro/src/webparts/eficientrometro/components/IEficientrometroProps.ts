export interface IEficientrometroProps {
  title: string;
  titleSize: number;
  valueBlockFontSize: number;
  background: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  color: boolean;
  year: string;
  totalValores: string;
  totalHoras: string;
  items: IEficientrometroCollectionDataProps[] | [];
}

export interface IEficientrometroCollectionDataProps {
  titulo: string;
  ano: string;
  valor: number;
  horas: number;
}

