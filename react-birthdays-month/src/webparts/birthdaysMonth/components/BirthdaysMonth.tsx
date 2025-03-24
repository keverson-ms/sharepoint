import * as React from 'react';
import styles from './BirthdaysMonth.module.scss';
import type { IBirthdaysMembersItem, IBirthdaysMonthProps } from './IBirthdaysMonthProps';
import { TestImages } from '@fluentui/example-data';
import {
  Persona,
  PersonaInitialsColor,
  PersonaSize,
} from 'office-ui-fabric-react/lib/Persona';
import { Icon } from 'office-ui-fabric-react/lib/Icon';
import { TeamsMessageModal } from './TeamsMessageModal';
export default class BirthdaysMonth extends React.Component<IBirthdaysMonthProps> {

  public render(): React.ReactElement<IBirthdaysMonthProps> {
    const {
      absoluteUrl,
      hasTeamsContext,
      webPartContext,
      messageDefault,
      msGraph,
      month,
    } = this.props;

    return (
      <section className={`${styles.birthdaysMonth} ${hasTeamsContext ? styles.teams : ''}`}>
        {this.props.title && (
          <>
            <h2 className={styles.title}>{messageDefault ? this.props.title + ' - ' + month : this.props.title}</h2>
            <hr />
          </>
        )}

        <div className={styles.overflow}>
          {this.props.members && this.props.members.length > 0 ? (
            this.props.members.map((member: IBirthdaysMembersItem, key: number) => (
              <>
                <div className={`${styles.dflex} ${styles.alignItemsCenter} ${styles.justifyContentSpaceBetween}`}>
                  <Persona
                    key={key}
                    className={`${styles.my1} ${new Date(`${member.dateBirth}`).getDate() === new Date().getDate() ? `${styles.active}` : ''}`}
                    imageShouldFadeIn={true}
                    size={PersonaSize.size72}
                    text={member.displayName}
                    secondaryText={member.jobTitle}
                    imageUrl={`${absoluteUrl}/_layouts/15/userphoto.aspx?size=L&accountname=${member.mail}` || TestImages.personaMale}
                    initialsColor={PersonaInitialsColor.gold}
                    styles={{
                      primaryText: [
                        styles.fontWeightBold,
                        styles.colorTheme,
                        styles.fontSize1rem,
                        new Date(`${member.dateBirth}`).getDate() === new Date().getDate() ? `${styles.active}` : ''
                      ],
                      secondaryText: [
                        styles.fontWeight600,
                      ],
                      tertiaryText: [
                        styles.fontWeightBold,
                        styles.colorTheme,
                        styles.pulse,
                        new Date(`${member.dateBirth}`).getDate() === new Date().getDate() ? `${styles.active}` : ''
                      ],
                    }}
                    onRenderTertiaryText={() => (
                      <div className={styles.dflex}>
                        {new Date(`${member.dateBirth}`).getDate() === new Date().getDate() && (
                          <Icon iconName="BirthdayCake" className={`${styles.fontSize1} ${styles.mx1}`} />
                        )}
                        {`${member.dayBirthExtension} `}
                      </div>
                    )}
                  />
                  <TeamsMessageModal member={member} props={webPartContext} msGraph={msGraph} caracteres={this.props.caracteres} imageModal={this.props.imageModal} />
                </div>
              </>
            ))
          ) : (
            this.props.group ? 'Selecione um grupo para listar os aniversariantes' : 'Nenhum aniversariante encontrado'
          )}
        </div>
      </section>
    );
  }
}
