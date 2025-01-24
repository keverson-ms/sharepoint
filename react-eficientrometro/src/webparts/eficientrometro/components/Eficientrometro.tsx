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
        <div className={`${styles['ms-Grid']}`}>
          <div className={`${styles['ms-Grid-row']} ${styles['d-flex']} ${styles['align-items-center']} ${styles['background-logo']}`}>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md3']} ${styles['ms-lg3']} ${isDarkTheme ? '' : styles.filterInverted}`}>
              <img alt="" src={!this.props.color ? require('../assets/marca_sistema_preta.png') : require('../assets/marca_sistema_branca.png')} className={styles.welcomeImage} />
            </div>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md9']} ${styles['ms-lg9']}`}>
              <h2 className={`${styles.title} ${styles['ms-fontWeight-bold']}`}>{title}</h2>
            </div>
          </div>
          <div className={styles['ms-Grid-row']}>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md12']} ${styles['ms-lg12']} ${styles['ms-xl6']}`}>
              <div className={`${styles.valores} ${styles['ms-font-su']} ${styles['ms-fontWeight-bold']}`}>
                R$ <span className={`counter-up`}>150.250,33</span>
              </div>
              <div className={`${styles['ms-fontWeight-bold']} ${styles['ms-fontSize-16']} ${styles.descricao}`}>
                Economia gerada 2025 (acumulada)
              </div>
            </div>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md12']} ${styles['ms-lg12']} ${styles['ms-xl6']}`}>
              <div className={`${styles.valores} ${styles['ms-font-su']} ${styles['ms-fontWeight-bold']}`}>
                <span className={`counter-up`}>4.000</span> hs
              </div>
              <div className={`${styles['ms-fontWeight-bold']} ${styles['ms-fontSize-16']} ${styles.descricao}`}>
                Ganho de Produtividade Operacional
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
