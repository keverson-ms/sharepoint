import * as React from 'react';
import styles from './BirthdaysMonth.module.scss';
import type { IBirthdaysMonthProps } from './IBirthdaysMonthProps';
// import { escape } from '@microsoft/sp-lodash-subset';
import { ActivityItem, IActivityItemProps, Link, mergeStyleSets } from '@fluentui/react';
import { TestImages } from '@fluentui/example-data';

export default class BirthdaysMonth extends React.Component<IBirthdaysMonthProps> {

  public componentDidMount(): void {
    this.componentDidUpdate(this.props);
  }

  public componentDidUpdate(prevProps: IBirthdaysMonthProps): void {
    console.log(prevProps.members);
    prevProps.title !== this.props.title;
    prevProps.members !== this.props.members;
  }
  public render(): React.ReactElement<IBirthdaysMonthProps> {
    const {
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

    const activityItemExamples: (IActivityItemProps & { key: string | number })[] = [
      {
        key: 1,
        activityDescription: [
          <Link
            key={1}
            className={classNames.nameText}
            onClick={() => {
              alert('A name was clicked.');
            }}
          >
            Jack Howden
          </Link>,
          <span key={2}> renamed </span>,
          <span key={3} className={classNames.nameText}>
            DocumentTitle.docx
          </span>,
        ],
        // activityPersonas: [{ imageUrl: `${escape(this.context.pageContext.site.absoluteUrl)}/_layouts/15/userphoto.aspx?size=L&accountname=${escape(this.context.pageContext.user.email)}` }],
        activityPersonas: [{ imageUrl: TestImages.personaMale }],
        comments: 'Hello, this is the text of my basic comment!',
        timeStamp: '23m ago',
      }
    ];

    return (
      <section className={`${styles.birthdaysMonth} ${hasTeamsContext ? styles.teams : ''}`}>
        {this.props.title && (
          <>
            <h2>{this.props.title}</h2>
            <hr />
          </>
        )}
        {activityItemExamples.map((item: { key: string | number }) => (
          <ActivityItem {...item} key={item.key} className={classNames.exampleRoot} />
        ))}
      </section>
    );
  }
}
