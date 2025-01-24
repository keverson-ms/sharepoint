import * as React from 'react';
import styles from './Eficientrometro.module.scss';
import type { IEficientrometroProps } from './IEficientrometroProps';

export default class Eficientrometro extends React.Component<IEficientrometroProps> {
  public render(): React.ReactElement<IEficientrometroProps> {
    const {
      title,
      isDarkTheme,
      hasTeamsContext,
    } = this.props;

    console.log(this.props.background)

    return (
      <section className={`${styles.eficientrometro} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles['ms-Grid']}>
          <div className={`${styles['ms-Grid-row']}`}>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md12']} ${styles['ms-lg6']} ${isDarkTheme ? '' : styles.filterInverted}`}>
              <img alt="" src={isDarkTheme ? require('../assets/marca_sistema_preta.png') : require('../assets/marca_sistema_branca.png')} className={styles.welcomeImage} />
            </div>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md12']} ${styles['ms-lg6']}`}>
              <h2 className={`${styles['ms-fontSize-xxl']} ${styles['ms-fontWeight-bold']}`}>{title}</h2>
            </div>
          </div>
          <div className={styles['ms-Grid-row']}>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md12']} ${styles['ms-lg12']} ${styles['ms-xl6']} ${styles['ms-font-su']} ${styles['ms-fontWeight-bold']}`}>
              <div className={`${styles.valores}`}>
                R$ <span className={`counter-up`}>150.250,33</span>
              </div>
            </div>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md12']} ${styles['ms-lg12']} ${styles['ms-xl6']} ${styles['ms-font-su']} ${styles['ms-fontWeight-bold']}`}>
              <div className={`${styles.valores}`}>
                <span className={`counter-up`}>4.000</span> hs
              </div>
            </div>
          </div>
          <div className={styles['ms-Grid-row']}>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md12']} ${styles['ms-lg12']} ${styles['ms-xl6']} ${styles['ms-font-xl']} ${styles['ms-fontWeight-bold']}`}>
              Economia gerada 2025 (acumulada)
            </div>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md12']} ${styles['ms-lg12']} ${styles['ms-xl6']} ${styles['ms-font-xl']} `}>
              Ganho de Produtividade Operacional
            </div>
          </div>
        </div>
      </section>
    );
  }
}
