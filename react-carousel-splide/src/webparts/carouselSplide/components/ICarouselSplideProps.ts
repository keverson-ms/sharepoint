import { IFilePickerResult } from '@pnp/spfx-controls-react';

export interface ICarouselSplideItem extends IFilePickerResult {
  Titulo: string;
  Link: string;
  Imagem: string;
  Ativo: boolean;
}

export interface ICarouselSplideProps {
  description: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  title: string;
  perPage: number;
  roundedItem: number;
  autoplay: boolean;
  rewind: boolean;
  type: string;
  direction: string;
  padding: number;
  spaceBetweenItems: number;
  items: ICarouselSplideItem[];
}
