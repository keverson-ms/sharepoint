import * as React from 'react';
import styles from './BirthdaysMonth.module.scss';
import type { IBirthdaysMonthProps } from './IBirthdaysMonthProps';
// import { escape } from '@microsoft/sp-lodash-subset';
import { ActivityItem, Link, mergeStyleSets } from '@fluentui/react';
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
    });

    // const activityItemExamples: (IActivityItemProps & { key: string | number })[] = [
    //   {
    //     key: 1,
    //     activityDescription: [
    //       <Link
    //         key={1}
    //         className={classNames.nameText}
    //         onClick={() => {
    //           alert('A name was clicked.');
    //         }}
    //       >
    //         Jack Howden
    //       </Link>,
    //       <span key={2}> renamed </span>,
    //       <span key={3} className={classNames.nameText}>
    //         DocumentTitle.docx
    //       </span>,
    //     ],
    //     // activityPersonas: [{ imageUrl: `${escape(this.context.pageContext.site.absoluteUrl)}/_layouts/15/userphoto.aspx?size=L&accountname=${escape(this.context.pageContext.user.email)}` }],
    //     activityPersonas: [{ imageUrl: TestImages.personaMale }],
    //     comments: 'Hello, this is the text of my basic comment!',
    //     timeStamp: '23m ago',
    //   }
    // ];

    console.log(this.props.members);
    // return (
    //   <section className={`${styles.birthdaysMonth} ${hasTeamsContext ? styles.teams : ''}`}>
    //     {this.props.title && (
    //       <>
    //         <h2>{this.props.title}</h2>
    //         <hr />
    //       </>
    //     )}
    //     {activityItemExamples.map((item: { key: string | number }) => (
    //       <ActivityItem {...item} key={item.key} className={classNames.exampleRoot} />
    //     ))}
    //   </section>
    // );
    console.log(this)
    return (
      <section className={`${styles.birthdaysMonth} ${hasTeamsContext ? styles.teams : ''}`}>
        {this.props.title && (
          <>
            <h2>{this.props.title}</h2>
            <hr />
          </>
        )}
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
                },
              ]}
              comments={member.jobTitle}
              timeStamp={member.dateBirthExtension}
              className={classNames.exampleRoot}
            />
          ))
        ) : (
          <p>Não há aniversariantes neste mês.</p>
        )}
      </section>
    );
  }
}
