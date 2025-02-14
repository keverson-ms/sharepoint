import * as React from 'react';
import styles from './Eficientrometro.module.scss';
import type { IEficientrometroProps } from './IEficientrometroProps';
import { Pivot, PivotItem, Label } from 'office-ui-fabric-react';
// import { Pivot, PivotItem, Label } from '@fluentui/react';

export default class Eficientrometro extends React.Component<IEficientrometroProps> {

  public render(): React.ReactElement<IEficientrometroProps> {
    const {
      title,
      year,
      totalValores,
      totalHoras,
      isDarkTheme,
      hasTeamsContext,
    } = this.props;

    return (
      <section className={`${styles.eficientrometro} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={`${styles['ms-Grid']}`}>
          <div className={`${styles['ms-Grid-row']} ${styles['d-flex']} ${styles['align-items-center']} ${styles['background-logo']}`}>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md3']} ${styles['ms-lg3']} ${isDarkTheme ? '' : styles.filterInverted}`}>
              <img alt="" src={this.props.color ? require('../assets/marca_sistema_branca.png') : require('../assets/marca_sistema_preta.png')} className={styles.welcomeImage} />
            </div>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md9']} ${styles['ms-lg9']}`}>
              <h2 className={`${styles.title} ${styles['ms-fontWeight-bold']}`}>{title}</h2>
            </div>
          </div>
          <div className={`${styles['ms-Grid-row']}`}>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md12']} ${styles['ms-lg12']}`}>
              <Pivot>
                <PivotItem headerText="2026">
                  <Label>2026</Label>
                </PivotItem>
                <PivotItem headerText="2025">
                  <Label>2025</Label>
                </PivotItem>
                <PivotItem headerText="2024">
                  <Label>2024</Label>
                </PivotItem>
                <PivotItem headerText="2023">
                  <Label>2023</Label>
                </PivotItem>
              </Pivot>
            </div>
          </div>
          <div className={styles['ms-Grid-row']}>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md12']} ${styles['ms-lg12']} ${styles['ms-xl6']}`}>
              <div className={`${styles.valueBlockFontSize} ${styles['ms-fontWeight-bold']}`}>
                <span className={styles.prefixValue}>R$</span> <span className={`counter-up ${styles.valores}`} data-value={totalValores} data-money>{totalValores}</span>
              </div>
              <div className={`${styles['ms-fontWeight-bold']} ${styles['ms-fontSize-16']} ${styles.descricao}`}>
                Economia gerada em <span className={`counter-up`} data-value={year}>{year}</span> (acumulada)
              </div>
            </div>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md12']} ${styles['ms-lg12']} ${styles['ms-xl6']}`}>
              <div className={`${styles.valueBlockFontSize} ${styles['ms-fontWeight-bold']}`}>
                <span className={`counter-up ${styles.valores}`} data-value={totalHoras}>{totalHoras}</span> <span className={styles.prefixValue}>hs</span>
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
