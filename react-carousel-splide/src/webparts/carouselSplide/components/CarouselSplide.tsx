import * as React from 'react';
import '@splidejs/splide/dist/css/splide.min.css';
import Splide from '@splidejs/splide';
import styles from './CarouselSplide.module.scss';
import type { ICarouselSplideProps } from './ICarouselSplideProps';

export default class CarouselSplide extends React.Component<ICarouselSplideProps> {
  private splideInstance: Splide | null = null;
  private generatedUniqueId: string = crypto.randomUUID();

  public componentDidMount(): void {
    this.initializeSplide();
  }

  public componentDidUpdate(prevProps: ICarouselSplideProps): void {
    if (
      prevProps.perPage !== this.props.perPage ||
      prevProps.roundedItem !== this.props.roundedItem ||
      prevProps.autoplay !== this.props.autoplay ||
      prevProps.rewind !== this.props.rewind ||
      prevProps.type !== this.props.type ||
      prevProps.direction !== this.props.direction ||
      prevProps.padding !== this.props.padding ||
      prevProps.spaceBetweenItems !== this.props.spaceBetweenItems ||
      prevProps.items !== this.props.items
    ) {
      this.reinitializeSplide();
    }
  }

  public componentWillUnmount(): void {
    this.destroySplide();
  }

  public render(): React.ReactElement<ICarouselSplideProps> {
    const { hasTeamsContext, items = [] } = this.props;

    return (
      <section className={`${styles.carouselSplide} ${hasTeamsContext ? styles.teams : ''}`}>
        <h3>{this.props.title ? `${this.props.title}` : ``}</h3>
        <p>{this.props.description ? `${this.props.description}` : ``}</p>
        <div id={this.generatedUniqueId} className="splide">
          <div className="splide__track">
            <ul className="splide__list">
              {items.map((item, index) => (
                item.Ativo ? (<li key={index} className="splide__slide">
                  <a href={item.Link ?? '#'} target={item.Link ? '_blank' : '_self'} rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
                    <img src={item.Imagem} alt={item.Titulo} width="100%" style={{ borderRadius: `${this.props.roundedItem}%` }} />
                    <p className='root-88'>{item.Titulo}</p>
                  </a>
                </li>) : null
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  private initializeSplide(): void {
    const element = document.getElementById(this.generatedUniqueId);

    if (element) {
      this.splideInstance = new Splide(element, {
        type: this.props.type || 'loop',
        perPage: this.props.perPage || 3,
        autoplay: this.props.autoplay || true,
        rewind: this.props.rewind || true,
        direction: this.props.direction ? 'rtl' : 'ltr',
        padding: `${this.props.padding || 0}%`,
        gap: `${this.props.spaceBetweenItems}px`,
      }).mount();
    }
  }

  private reinitializeSplide(): void {
    this.destroySplide();
    this.initializeSplide();
  }

  private destroySplide(): void {
    if (this.splideInstance) {
      this.splideInstance.destroy();
      this.splideInstance = null;
    }
  }
}
