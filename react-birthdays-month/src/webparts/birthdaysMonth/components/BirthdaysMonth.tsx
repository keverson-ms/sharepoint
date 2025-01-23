import * as React from 'react';
import styles from './BirthdaysMonth.module.scss';
import type { IBirthdaysMembersItem, IBirthdaysMonthProps } from './IBirthdaysMonthProps';
// import { escape } from '@microsoft/sp-lodash-subset';
import { ActivityItem, Link, PersonaSize } from '@fluentui/react';
import { TestImages } from '@fluentui/example-data';

export default class BirthdaysMonth extends React.Component<IBirthdaysMonthProps> {

  public render(): React.ReactElement<IBirthdaysMonthProps> {
    const {
      absoluteUrl,
      // isDarkTheme,
      // environmentMessage,
      hasTeamsContext,
      // userDisplayName
    } = this.props;

    return (
      <section className={`${styles.birthdaysMonth} ${hasTeamsContext ? styles.teams : ''}`}>
        {this.props.title && (
          <>
            <h2 className={styles.title}>{this.props.title}</h2>
            <hr />
          </>
        )}
        <div className={styles.overflow} style={{ maxHeight: `${this.props.overflow}px` }}>
          {this.props.members && this.props.members.length > 0 ? (
            this.props.members.map((member: IBirthdaysMembersItem, index: number) => (
              <ActivityItem
                key={index}
                activityDescription={[
                  <Link key={`${index}-displayName`} className={styles.fontWeightBold} href={`mailto:${member.mail}?subject=Feliz Aniversário!&body=${member.givenName} ${member.surname}`}>
                    {member.displayName}
                  </Link>,
                  <span key={1}> - </span>,
                  <small key={2} className={`${styles.fontWeightBold}`}>{member.dateBirthExtension}</small>
                ]}
                activityPersonas={[
                  {
                    imageUrl: `${absoluteUrl}/_layouts/15/userphoto.aspx?size=L&accountname=${member.mail}` || TestImages.personaMale,
                    size: PersonaSize.size120
                  }
                ]}
                comments={[
                  member.jobTitle + ' - ',
                  <Link key={`{${index}-mail}`} href={`mailto:${member.mail}?subject=Feliz Aniversário!&body=${member.givenName} ${member.surname}`}> {member.mail} </Link>
                ]}
                className={`${styles.root}`}
              />
            ))
          ) : (
            this.props.group ? 'Selecione um grupo para listar os aniversariantes' : 'Nenhum aniversariante encontrado'
          )}
        </div>
      </section>
    );
  }
}
