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
  items: IEficientrometroCollectionDataProps[] | [];
  years: IEficientrometroCollectionDataYearsProps[] | [];
  animateCounterUp: () => void;
}

export interface IEficientrometroCollectionDataProps {
  titulo: string;
  ano: number;
  valor: number;
  horas: number;
}

export interface IEficientrometroCollectionDataYearsProps {
  ano: number,
  totalHoras: number,
  totalValores: number
}

export interface IEficientrometroCollectionDataListProps {
  [ano: number]: IEficientrometroCollectionDataYearsProps;
}

