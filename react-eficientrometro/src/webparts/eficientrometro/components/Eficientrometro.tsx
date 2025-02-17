import * as React from 'react';
import styles from './Eficientrometro.module.scss';
import type { IEficientrometroCollectionDataYearsProps, IEficientrometroProps } from './IEficientrometroProps';
import { Pivot, PivotItem, Label } from 'office-ui-fabric-react';

export default class Eficientrometro extends React.Component<IEficientrometroProps> {

  protected active: string = new Date().getFullYear().toString();

  private handleTabClick = (item?: PivotItem): void => {

    this.active = item?.props?.headerText ?? new Date().getFullYear().toString();
    if (item) {
      setTimeout(() => {
        (this.props.animateCounterUp as () => void)();
      }, 0);
    }
  };

  public render(): React.ReactElement<IEficientrometroProps> {
    const {
      title,
      years,
      isDarkTheme,
      hasTeamsContext,
    } = this.props;

    return (
      <section className={`${styles.eficientrometro} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={`${styles['ms-Grid']}`}>
          <div className={`${styles['ms-Grid-row']} ${styles['d-flex']} ${styles['align-items-center']} ${styles['background-logo']} ${styles.mb1}`}>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md3']} ${styles['ms-lg3']} ${isDarkTheme ? '' : styles.filterInverted}`}>
              <img alt="" src={this.props.color ? require('../assets/marca_sistema_branca.png') : require('../assets/marca_sistema_preta.png')} className={styles.welcomeImage} />
            </div>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md9']} ${styles['ms-lg9']}`}>
              <h2 className={`${styles.title} ${styles['ms-fontWeight-bold']}`}>{title}</h2>
            </div>
          </div>
          <div className={`${styles['ms-Grid-row']}`}>
            <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md12']} ${styles['ms-lg12']} ${styles.p0}`}>
              <Pivot className={styles.yearsTabs} onLinkClick={this.handleTabClick} defaultSelectedKey={this.active}>
                ({years.map((item: IEficientrometroCollectionDataYearsProps) =>
                  <PivotItem headerText={item.ano.toString()} key={item.ano} itemKey={item.ano.toString()}>
                    <Label>
                      <div className={styles['ms-Grid-row']}>
                        <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md12']} ${styles['ms-lg12']} ${styles['ms-xl6']}`}>
                          <div className={`${styles.valueBlockFontSize} ${styles['ms-fontWeight-bold']}`}>
                            <span className={styles.prefixValue}>R$</span> <span className={`counter-up ${styles.valores}`} data-value={item.totalValores} data-money>{item.totalValores}</span>
                          </div>
                          <div className={`${styles['ms-fontWeight-bold']} ${styles['ms-fontSize-16']} ${styles.descricao} ${styles.mb1}`}>
                            Economia gerada em <span className={`counter-up`} data-value={item.ano.toString()}>{item.ano.toString()}</span> (acumulada)
                          </div>
                        </div>
                        <div className={`${styles['ms-Grid-col']} ${styles['ms-sm12']} ${styles['ms-md12']} ${styles['ms-lg12']} ${styles['ms-xl6']}`}>
                          <div className={`${styles.valueBlockFontSize} ${styles['ms-fontWeight-bold']}`}>
                            <span className={`counter-up ${styles.valores}`} data-value={item.totalHoras}>{item.totalHoras}</span> <span className={styles.prefixValue}>hs</span>
                          </div>
                          <div className={`${styles['ms-fontWeight-bold']} ${styles['ms-fontSize-16']} ${styles.descricao} ${styles.mb1}`}>
                            Ganho de Produtividade Operacional
                          </div>
                        </div>
                      </div>
                    </Label>
                  </PivotItem>
                )})
              </Pivot>
            </div>
          </div>
        </div>
      </section>
    );
  }
}
