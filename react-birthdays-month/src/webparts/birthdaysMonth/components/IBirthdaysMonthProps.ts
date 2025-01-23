export interface IBirthdaysMonthProps {
  title: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  members: IBirthdaysMembersItem[];
  group: string;
  absoluteUrl: string;
  overflow: number;
}

export interface IBirthdaysMembersItem {
  displayName: string;
  givenName: string;
  id: string;
  jobTitle: string;
  mail: string;
  mobilePhone: string;
  officeLocation: string;
  dateBirth: string;
  dateBirthExtension: string;
  preferredLanguage: string;
  surname: string;
  userPrincipalName: string;
}

export interface IBirthdaysMembersGroupsItem {
  key: string;
  text: string
}
