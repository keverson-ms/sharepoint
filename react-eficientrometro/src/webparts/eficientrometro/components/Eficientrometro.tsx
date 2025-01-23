import * as React from 'react';
import styles from './Eficientrometro.module.scss';
import type { IEficientrometroProps } from './IEficientrometroProps';
// import { escape } from '@microsoft/sp-lodash-subset';
// import { Fabric } from 'office-ui-fabric-react/lib/Fabric';

export default class Eficientrometro extends React.Component<IEficientrometroProps> {
  public render(): React.ReactElement<IEficientrometroProps> {
    const {
      title,
      isDarkTheme,
      hasTeamsContext,
    } = this.props;

    return (
      <section className={`${styles.eficientrometro} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles['ms-Grid']}>
          <div className={`${styles['ms-Grid-row']}`}>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm6']} ${styles['ms-md6']} ${styles['ms-lg6']} ${isDarkTheme ? '' : styles.filterInverted}`}>
              <img alt="" src={isDarkTheme ? require('../assets/marca_sistema_preta.png') : require('../assets/marca_sistema_branca.png')} className={styles.welcomeImage} />
            </div>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm6']} ${styles['ms-md6']} ${styles['ms-lg6']}`}>
              <h2 className={`${styles['ms-fontSize-su']} ${styles['ms-fontWeight-bold']}`}>{title}</h2>
            </div>
          </div>
          <div className={styles['ms-Grid-row']}>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm6']} ${styles['ms-md6']} ${styles['ms-lg6']} ${styles['ms-font-su']} ${styles['ms-fontWeight-bold']}`}>
              R$ <span className={`counter-up`}>150.250,33</span>
            </div>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm6']} ${styles['ms-md6']} ${styles['ms-lg6']} ${styles['ms-font-su']} ${styles['ms-fontWeight-bold']}`}>
              <span className={`counter-up`}>4.000 hs</span>
            </div>
          </div>
          <div className={styles['ms-Grid-row']}>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm6']} ${styles['ms-md6']} ${styles['ms-lg6']}`}>
              Economia gerada 2025 (acumulada)
            </div>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm6']} ${styles['ms-md6']} ${styles['ms-lg6']}`}>
              Ganho de Produtividade Operacional
            </div>
          </div>
        </div>
      </section>
    );
  }
}
