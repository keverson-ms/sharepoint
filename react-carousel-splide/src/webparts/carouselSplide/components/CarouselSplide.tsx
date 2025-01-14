import * as React from 'react';
import styles from './CarouselSplide.module.scss';
import type { ICarouselSplideProps } from './ICarouselSplideProps';
import Splide from '@splidejs/splide';
import '@splidejs/splide/dist/css/splide.min.css';

export default class CarouselSplide extends React.Component<ICarouselSplideProps> {

  private splideInstance: Splide | null = null; // Variável para armazenar a instância do Splide

  public componentDidMount(): void {
    this.initializeSplide(); // Inicializa o Splide ao carregar o componente
  }

  public componentWillUnmount(): void {
    if (this.splideInstance) {
      this.splideInstance.destroy(); // Destrói a instância do Splide ao desmontar o componente
    }
  }

  public render(): React.ReactElement<ICarouselSplideProps> {
    const { hasTeamsContext, items } = this.props;
    return (
      <section className={`${styles.carouselSplide} ${hasTeamsContext ? styles.teams : ''} splide`}>
        <div className="splide__track">
          <ul className="splide__list">
            {this.props.items.map(function (item, index) {
              return (
                <li key={index} className="splide__slide">
                  {item}
                </li>
              );
            }) ?? items}
          </ul>
        </div>
      </section>
    );
  }

  protected initializeSplide(): void {
    this.splideInstance = new Splide('.splide', {
      type: this.props.type || 'loop',
      perPage: this.props.perPage || 3,
      autoplay: this.props.autoplay || true,
      rewind: this.props.rewind || true,
      direction: this.props.direction ? 'rtl' : 'ltr',
      padding: `${this.props.padding || 0}rem`,
    }).mount();
  }
}
