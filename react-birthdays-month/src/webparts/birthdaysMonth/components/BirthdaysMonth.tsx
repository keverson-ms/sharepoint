import * as React from 'react';
import styles from './BirthdaysMonth.module.scss';
import type { IBirthdaysMembersItem, IBirthdaysMonthProps } from './IBirthdaysMonthProps';
import { TestImages } from '@fluentui/example-data';
import {
  Persona,
  PersonaInitialsColor,
  PersonaSize,
} from 'office-ui-fabric-react/lib/Persona';

import { TeamsMessageModal } from './TeamsMessageModal';
export default class BirthdaysMonth extends React.Component<IBirthdaysMonthProps> {

  public render(): React.ReactElement<IBirthdaysMonthProps> {
    const {
      absoluteUrl,
      hasTeamsContext,
      webPartContext
    } = this.props;

    return (
      <section className={`${styles.birthdaysMonth} ${hasTeamsContext ? styles.teams : ''}`}>
        {this.props.title && (
          <>
            <h2 className={styles.title}>{this.props.title}</h2>
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
                    className={styles.my1}
                    imageShouldFadeIn={true}
                    size={PersonaSize.size72}
                    text={member.displayName}
                    secondaryText={member.jobTitle}
                    tertiaryText={member.dateBirthExtension}
                    imageUrl={`${absoluteUrl}/_layouts/15/userphoto.aspx?size=L&accountname=${member.mail}` || TestImages.personaMale}
                    initialsColor={PersonaInitialsColor.gold}
                    styles={{
                      primaryText: [styles.fontWeightBold, styles.colorTheme, styles.fontSize1rem],
                      secondaryText: [styles.fontWeight600],
                      tertiaryText: [styles.fontWeightBold, styles.colorTheme, styles.pulse],
                    }}
                  />
                  <TeamsMessageModal member={member} props={webPartContext} />
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
