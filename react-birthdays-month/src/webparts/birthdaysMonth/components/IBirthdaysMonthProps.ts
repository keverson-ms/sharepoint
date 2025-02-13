import { WebPartContext } from "@microsoft/sp-webpart-base";
import msGraphProvider from "../../services/msGraphProvider";
import { IFilePickerResult } from "@pnp/spfx-property-controls";

export interface IBirthdaysMonthProps {
  title: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
  members: IBirthdaysMembersItem[];
  group: string;
  imageModal: IFilePickerResult;
  absoluteUrl: string;
  overflow: number;
  webPartContext: WebPartContext,
  msGraph: msGraphProvider,
  caracteres: number
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
  dayBirthExtension: string;
  preferredLanguage: string;
  surname: string;
  userPrincipalName: string;
}

export interface IBirthdaysMembersGroupsItem {
  key: string;
  text: string
}
