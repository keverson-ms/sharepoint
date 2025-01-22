import * as React from 'react';
import styles from './BirthdaysMonth.module.scss';
import type { IBirthdaysMonthProps } from './IBirthdaysMonthProps';
// import { escape } from '@microsoft/sp-lodash-subset';
import { ActivityItem, Link, mergeStyleSets, PersonaSize } from '@fluentui/react';
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

    const classNames = mergeStyleSets({
      exampleRoot: {
        marginTop: '20px',
      },
      nameText: {
        fontWeight: 'bold',
      },
      'overflow-400': {
        overflow: 'overlay',
        'max-height': '400px',
      }
    });

    return (
      <section className={`${styles.birthdaysMonth} ${hasTeamsContext ? styles.teams : ''}`}>
        {this.props.title && (
          <>
            <h2>{this.props.title}</h2>
            <hr />
          </>
        )}
        <div className={classNames['overflow-400']}>
          {this.props.members && this.props.members.length > 0 ? (
            this.props.members.map((member: any, index: number) => (
              <ActivityItem
                key={index}
                activityDescription={[
                  <Link key={`${index}-name`} className={classNames.nameText}>
                    {member.displayName}
                  </Link>,
                ]}
                activityPersonas={[
                  {
                    imageUrl: `${absoluteUrl}/_layouts/15/userphoto.aspx?size=L&accountname=${member.mail}` || TestImages.personaMale,
                    size: PersonaSize.size56
                  }
                ]}
                comments={member.jobTitle}
                timeStamp={member.dateBirthExtension}
                className={classNames.exampleRoot}
              />
            ))
          ) : (
            <p>Não há aniversariantes neste mês.</p>
          )}
        </div>
      </section>
    );
  }
}
