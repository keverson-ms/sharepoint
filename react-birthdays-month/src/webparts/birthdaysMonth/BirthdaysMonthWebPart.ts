import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'BirthdaysMonthWebPartStrings';
import BirthdaysMonth from './components/BirthdaysMonth';
import { IBirthdaysMonthProps, IBirthdaysMembersItem } from './components/IBirthdaysMonthProps';
import { AadHttpClient, HttpClientResponse } from '@microsoft/sp-http';

export interface IBirthdaysMonthWebPartProps {
  title: string;
  messageDefault: boolean;
  group: string;
  members: IBirthdaysMembersItem[];
  absoluteUrl: string;
}

export default class BirthdaysMonthWebPart extends BaseClientSideWebPart<IBirthdaysMonthWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';
  private _groupOptions: { key: string; text: string }[] = [];

  public render(): void {

    const getMonth = (): string => {
      const dataAtual = new Date();

      return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(dataAtual);
    };

    const element: React.ReactElement<IBirthdaysMonthProps> = React.createElement(
      BirthdaysMonth,
      {
        title: this.properties.title = (this.properties.messageDefault ? (this.properties.title = 'Aniversariantes do Mês - ' + getMonth().replace(/^\w/, (c) => c.toUpperCase())) : this.properties.title),
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName,
        members: this.properties.members ?? [],
        absoluteUrl: `${this.context.pageContext.web.absoluteUrl}`
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    await super.onInit();

    this._groupOptions = await this._fetchGroups();

    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
    }

  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {

    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupFields: [
                PropertyPaneTextField('title', {
                  label: strings.TitleSectionFieldLabel,
                  value: this.properties.title,
                  disabled: this.properties.messageDefault
                }),
                PropertyPaneToggle('messageDefault', {
                  label: strings.MessageDefaultFieldLabel,
                  checked: this.properties.messageDefault,
                  onText: 'Sim',
                  offText: 'Não',
                  onAriaLabel: 'Y',
                  offAriaLabel: 'N'
                }),
                PropertyPaneDropdown('group', {
                  label: strings.GroupAzureFieldLabel,
                  options: this._groupOptions.length > 0 ? this._groupOptions : [{ key: '', text: 'Carregando...' }],
                  selectedKey: this.properties.group
                })
              ]
            }
          ]
        }
      ]
    };
  }

  protected async onPropertyPaneFieldChanged(propertyPath: string, oldValue: any, newValue: any): Promise<void> {
    super.onPropertyPaneFieldChanged(propertyPath, oldValue, newValue);

    if (this.properties.group && propertyPath === 'group' && newValue !== oldValue) {
      this.properties.group = newValue;
      this.properties.members = await this._fetchGroupMembers(newValue);
      this.render();
    }

    console.log(this.properties.group)
  }


  private async _getAadHttpClient(): Promise<AadHttpClient> {
    return this.context.aadHttpClientFactory.getClient('https://graph.microsoft.com');
  }

  private async _fetchGroups(): Promise<{ key: string; text: string }[]> {
    const client = await this._getAadHttpClient();

    const response: HttpClientResponse = await client.get(
      "https://graph.microsoft.com/v1.0/groups?$select=id,displayName,description&$filter=((NOT groupTypes/any(c:c eq 'Unified')) and (mailEnabled eq true) and (securityEnabled eq true) and (description%20ne%20null))&$count=true&$top=999",
      AadHttpClient.configurations.v1,
      {
        headers: {
          'ConsistencyLevel': 'eventual'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar grupos: ${response.statusText}`);
    }

    const data = await response.json();

    const groups = data.value.map((group: any) => ({
      key: group.id,
      text: (`${group.description}`).toUpperCase()
    }));

    return groups;
  }

  private async _fetchGroupMembers(groupId: string): Promise<IBirthdaysMembersItem[]> {

    if (groupId) {
      const client = await this._getAadHttpClient();

      const response: HttpClientResponse = await client.get(
        `https://graph.microsoft.com/v1.0/groups/${groupId}/members?$count=true&$filter=(accountEnabled eq true)&$top=999`,
        AadHttpClient.configurations.v1,
        {
          headers: {
            'ConsistencyLevel': 'eventual'
          }
        }
      );

      const data = await response.json();

      const isValidDate = (dateStr: string): boolean => {
        const date = new Date(dateStr);
        return !isNaN(date.getTime());
      };

      const formatDateToPortuguese = (dateStr: string): string | null => {
        if (!isValidDate(dateStr)) return null;

        const date = new Date(dateStr);

        return new Intl.DateTimeFormat('pt-BR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(date).replace(/^\w/, (c) => c.toUpperCase());
      };

      const members = data.value.filter((member: any) => {
        if (!isValidDate(member.officeLocation)) return false;

        const birthDate = new Date(member.officeLocation);
        const currentMonth = new Date().getMonth();

        return birthDate.getMonth() === currentMonth;
      })
        .sort((a: any, b: any) => {
          const dateA = new Date(a.officeLocation).getDate();
          const dateB = new Date(b.officeLocation).getDate();
          return dateA - dateB;
        }).map((member: any) => (member ? {
          displayName: member.displayName,
          givenName: member.givenName,
          id: member.id,
          jobTitle: member.jobTitle,
          mail: member.mail,
          mobilePhone: member.mobilePhone,
          officeLocation: member.officeLocation,
          dateBirth: isValidDate(member.officeLocation) ? member.officeLocation : null,
          dateBirthExtension: isValidDate(member.officeLocation) ? formatDateToPortuguese(member.officeLocation) : null,
          preferredLanguage: member.preferredLanguage,
          surname: member.surname,
          userPrincipalName: member.userPrincipalName
        } : null));

      return members;
    }

    return [];
  }

}
